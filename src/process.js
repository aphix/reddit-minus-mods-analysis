'use strict';

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const path = require('path');
const {Sema} = require('async-sema');
const fetch = require('./fetchLikeRequest');
const ProgressBar = require('progress');

const posts = _.sortBy(require('../data/comments-combined.json'), '[0].data.children[0].data.created');

const promisifiedWriteFile = util.promisify(fs.writeFile);

const fileOutOptions = {
    encoding: 'utf8'
};

const jsonOutputOptions = {
    colors: false,
    depth: null,
    maxArrayLength: null
};

const bar = new ProgressBar('processing [:bar] :rate/s :percent :etas remaining (:elapseds elapsed)', {
    total: posts.length,
    complete: '▓',
    head: '▒',
    incomplete: '░'
});

const semaphore = new Sema(10, { capacity: posts.length });
const _log = (...vals) => {
	const asString = vals.map(v => _.isObject(v)
		?  util.inspect(v, jsonOutputOptions)
		: _.toString(v));

	bar.interrupt(`${new Date().toISOString()} ${asString.join(' ')}`);
}

const getUrlFromMarkdown = (str) => {
	if (!str) {
		return;
	}

	const matches = str.match(/\]\((\S+)\)/);
	if (!matches) {
		return;
	}

	const [unused, url] = matches;

	return url;
}
const getCommentsUrlFromMarkdown = (str) => {
	if (!str) {
		return;
	}

	const matches = str.match(/\((\/r\/\S+)\)$/);
	if (!matches) {
		return;
	}

	const [unused, url] = matches;

	return url;
}

const getTitleFromMarkdown = (str) => {
	if (!str) {
		return;
	}

	const matches = str.match(/^\[(.+)\]\(htt/);
	if (!matches) {
		return;
	}

	const [unused, title] = matches;

	return title;
}

const getNumComments = (str) => {
	const matches = str.match(/(\d+) comments/);
	if (!matches) {
		return;
	}

	const [unused, numComments] = matches;

	return parseInt(numComments, 10);
}


const subRexExp = /\) \((\S+)\) \[\\\[\*\*\d+ comments/;
const getSubredditFromMarkdown = (str) => {
	const matches = str.match(subRexExp);
	if (!matches) {
		return;
	}

	const [unused, subreddit] = matches;

	return subreddit;
}

const parseLine = (line) => {
    const [
    	index,
    	votes,
    	undeleteUrlMarkdown,
    	...originalUrlMarkdown
	] = line.split(/\s*\|\s*/g);

	const trimmedUndeleteMarkdown = (undeleteUrlMarkdown || '').trim();
	const recombinedOriginalUrlMarkdown = (originalUrlMarkdown || []).join('|').trim();

    return {
        rank: parseInt(index, 10),
        deleted: trimmedUndeleteMarkdown.length !== 0,
        title: getTitleFromMarkdown(recombinedOriginalUrlMarkdown),
        votes: parseInt(votes, 10),
        numComments: getNumComments(recombinedOriginalUrlMarkdown),
        subreddit: getSubredditFromMarkdown(recombinedOriginalUrlMarkdown),
        undeleteUrl: getUrlFromMarkdown(trimmedUndeleteMarkdown) || undefined,
        originalUrl: getUrlFromMarkdown(recombinedOriginalUrlMarkdown),
        commentsUrl: getCommentsUrlFromMarkdown(recombinedOriginalUrlMarkdown),
        undeleteUrlMarkdown: trimmedUndeleteMarkdown || undefined,
        originalUrlMarkdown: recombinedOriginalUrlMarkdown,
    };
}

const formatBody = (comment) => {
	const splitOnNewlines = _.compact(comment.split(/\s*[\n\r]+\s*/g).map(s => s.trim()).filter(s => /\S/.test(s)));

	//const badOnes = splitOnNewlines
	//	.map(s => s.split(/\s*\|\s*/g))
	//	.filter(s => s.length < 4)
	//	.filter(s => !/^From the top/.test(s));
	//if (badOnes.length) {
    //    _log('not 4', badOnes.map(s => ({
    //        original: s,
    //        parsed: parseLine(s.join('|'))
    //    })));
	//}

	return splitOnNewlines
		.filter(str => str.length >= 4)
		.slice(2)
		.map(parseLine)
		.filter(l => l.rank !== null && !Number.isNaN(l.rank));
}

const entriesBySubreddit = {};
const deletionsBySubreddit = {};

const ValidAuthors = ['SuperConductiveRabbi', 'DoMoreWithLess'];

const _processAndWriteBody = async (body) => {
	const comments = [];

	const commentOne = _.last(_.get(body, '[1].data.children', []))

	if (!ValidAuthors.includes(_.get(commentOne, 'data.author'))) {
		const author = _.get(commentOne, 'data.author');
		const commentBody = _.get(commentOne, 'data.body');
		if (author || commentBody) {
			_log('author', author, 'skipping', commentBody);
		}
	} else {
		comments.push(_.get(commentOne, 'data.body'));
	}

	const commentTwo = _.get(commentOne, 'data.replies.data.children', []).find(c => ValidAuthors.includes(c.data.author));

	if (!ValidAuthors.includes(_.get(commentTwo, 'data.author'))) {
		const author = _.get(commentTwo, 'data.author');
		const commentBody = _.get(commentTwo, 'data.body');
		if (author || commentBody) {
			_log('author', author, 'skipping ', commentBody);
		}
	} else {
		comments.push(_.get(commentTwo, 'data.body'));
	}

	const secondsSinceEpoch = _.get(body, '[0].data.children[0].data.created');
	const isoDate = new Date(secondsSinceEpoch*1000).toISOString();
	const filenameSafeDate = isoDate.slice(0,-5).replace(/\D+/g,'');

	const processedEntries = _.sortBy(_.flatten(comments.map(formatBody)), 'index');

	if (!processedEntries.length) {
		_log('skipping ', isoDate, 'no comments...');
		return;
	} else if (processedEntries.length !== 50) {
		_log('not 50 links in', isoDate)
	}

	for (const entry of processedEntries) {
		entry.timePostedToRedditMinusMods = isoDate;

		if (!entriesBySubreddit[entry.subreddit]) {
			entriesBySubreddit[entry.subreddit] = 0;
		}

		entriesBySubreddit[entry.subreddit]++;

		if (entry.deleted) {
			if (!deletionsBySubreddit[entry.subreddit]) {
				deletionsBySubreddit[entry.subreddit] = 0;
			}

			deletionsBySubreddit[entry.subreddit]++;
		}
	}

	const fullPath = path.resolve(__dirname, '../data/comment-body', filenameSafeDate+'.json');
	// _log(`writing out to`, fullPath);

	await promisifiedWriteFile(fullPath, JSON.stringify(processedEntries, null, 2), fileOutOptions);
};

(async () => {
	process.on('unhandledRejection', (err) => {
		console.error(err);
		process.exit(1);
	});

    async function processData(body) {
        await semaphore.acquire()
        try {
			await _processAndWriteBody(body);
        } catch(err) {
        	console.error(err);
        } finally {
        	bar.tick()
            semaphore.release();
        }
    }

    await Promise.all(posts.map(processData));

	console.log('\ncomplete\n');

	const sortedEntryStats = _.sortBy(_.toPairs(entriesBySubreddit), ([subreddit, numEntries]) => numEntries).reverse();

	const stats = {};

	for (const sub of sortedEntryStats.map(s => s[0])) {
		const deletes = deletionsBySubreddit[sub] || 0;
		const keeps = entriesBySubreddit[sub] - deletes;

		stats[sub] = {
			total: entriesBySubreddit[sub],
			deletes,
			keeps,
			deletePercent: Number(((deletes / entriesBySubreddit[sub]) * 100).toFixed(3)),
		};
	}

	const stringifiedStats = JSON.stringify(stats, null, 2);
	console.log('stats');console.log(stringifiedStats);

	const fullPath = path.resolve(__dirname, '../data/comment-body-stats.json');
	await promisifiedWriteFile(fullPath, stringifiedStats, fileOutOptions);
})();