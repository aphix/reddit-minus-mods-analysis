'use strict';

const _ = require('lodash');
const {Sema} = require('async-sema');
const fetch = require('./fetchLikeRequest');
const ProgressBar = require('progress');

const posts = _.sortBy(require('../data/allPosts.json'), 'created_utc');

const fs = require('fs');
const util = require('util');
const path = require('path');

const promisifiedWriteFile = util.promisify(fs.writeFile);

const fileOutOptions = {
    encoding: 'utf8'
};

const jsonOutputOptions = {
    colors: false,
    depth: null,
    maxArrayLength: null
};


const bar = new ProgressBar('farming [:bar] :rate/s :percent :etas remaining (:elapseds elapsed)', {
    total: posts.length,
    complete: '▓',
    head: '▒',
    incomplete: '░'
});

const semaphore = new Sema(4, { capacity: posts.length });
const _log = (...vals) => {
	const asString = vals.map(v => _.isObject(v)
		?  util.inspect(v, jsonOutputOptions)
		: _.toString(v));

	bar.interrupt(`${new Date().toISOString()} ${asString.join(' ')}`);
}

const _writeOutJson = async (body) => {
	const secondsSinceEpoch = _.get(body, '[0].data.children[0].data.created');
	const isoDate = new Date(secondsSinceEpoch*1000).toISOString();
	const filenameSafeDate = isoDate.slice(0,-5).replace(/\D+/g,'');

	const fullPath = path.resolve(__dirname, '../data/comment-full/', filenameSafeDate+'.json');
	_log(`writing out to`, fullPath);

	await promisifiedWriteFile(fullPath, JSON.stringify(body, null, 2), fileOutOptions);
};

(async () => {
	process.on('unhandledRejection', (err) => {
		console.error(err);
		process.exit(1);
	});

    async function fetchData({full_link: postUrl}) {
        await semaphore.acquire()
        try {

			const body = await fetch({
				method: 'get',
				url: postUrl+'.json'
			});

			await _writeOutJson(body);
        } catch(err) {
        	console.error(err);
        } finally {
        	bar.tick()
            semaphore.release();
        }
    }

    await Promise.all(posts.map(fetchData));

	console.log('\ncomplete\n');
})();