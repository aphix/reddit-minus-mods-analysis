# /r/RedditMinusMods Analysis & Data

[See this post for initial data and ongoing conversation](https://www.reddit.com/r/RedditMinusMods/comments/cwvf8a/a_rredditminusmods_user_requested_a_graph_of_the/)

Note: WIP, probably incomplete data, and probably some edge-cases missed. Feel free to submit PR.

Current number of processed links:

```
> node -e 'console.log(require("./data/processed-combined-flat.json").length)'
108458
```

## Requirements

- [jq](https://stedolan.github.io/jq/)
- [Node.js](https://nodejs.org) (v8+ should work, tested with v10)
- [7-Zip](https://www.7-zip.org/) (only needed for extracting pre-fetched/processed files)

## Install Dependencies


In terminal, go to this directory, and run:

`npm install`

## Run

In terminal, go to this directory, and run (view the script to see what it does):

`./farmAndProcess.sh`

## Clean Generated Files

In terminal, go to this directory, and run (view the script to see what it does):

`./clean.sh`

## Generated File Descriptions

`./data/allPosts.json`

Single file combining all post info as produced via RMM mod/bot [here](https://www.reddit.com/r/RedditMinusMods/comments/cwvf8a/a_rredditminusmods_user_requested_a_graph_of_the/).

`./data/comment-full/*.json`

Complete JSON responses of all RMM posts (farmed via URLS in `./data/allPosts.json`),  by date. (Compressed and included in repo for convenience as `./data/fullCommentsbyDate.7z`)

`./data/comments-combined.json`

Single combined file of all complete JSON responses of all posts. (Compressed and included in repo for convenience as `./data/fullCommentsCombined.7z`)

`./data/comment-body/*.json`

All processed bodies of RMM bot comment posts, by date. (Compressed and included in repo for convenience as `./data/processedCommentsByDate.7z`)

`./data/processed-combined.json`

Single combined file of processed comment bodies. (Compressed and included in repo for convenience as `./data/processedCommentsCombined.7z`)

`./data/processed-combined-flat.json`

Same as above, but flattened into single JSON array. (Compressed and included in repo for convenience as `./data/processedCommentsCombinedFlat.7z`)

`./data/comment-body-stats.json`

Simple statistics on total entry count & deltion count, by subreddit in JSON format.

## Top Seen Subreddit + Deletion Stats

```
{
  "funny": {
    "total": 7667,
    "deletes": 5318,
    "keeps": 2349,
    "deletePercent": 69.362
  },
  "gifs": {
    "total": 3463,
    "deletes": 1654,
    "keeps": 1809,
    "deletePercent": 47.762
  },
  "todayilearned": {
    "total": 3372,
    "deletes": 1689,
    "keeps": 1683,
    "deletePercent": 50.089
  },
  "mildlyinteresting": {
    "total": 3242,
    "deletes": 2169,
    "keeps": 1073,
    "deletePercent": 66.903
  },
  "gaming": {
    "total": 3229,
    "deletes": 1678,
    "keeps": 1551,
    "deletePercent": 51.967
  },
  "aww": {
    "total": 3217,
    "deletes": 1280,
    "keeps": 1937,
    "deletePercent": 39.789
  },
  "Showerthoughts": {
    "total": 3190,
    "deletes": 2553,
    "keeps": 637,
    "deletePercent": 80.031
  },
  "politics": {
    "total": 3153,
    "deletes": 860,
    "keeps": 2293,
    "deletePercent": 27.276
  },
  "pics": {
    "total": 3085,
    "deletes": 811,
    "keeps": 2274,
    "deletePercent": 26.288
  },
  "BlackPeopleTwitter": {
    "total": 2053,
    "deletes": 988,
    "keeps": 1065,
    "deletePercent": 48.125
  },
  "AdviceAnimals": {
    "total": 2004,
    "deletes": 950,
    "keeps": 1054,
    "deletePercent": 47.405
  },
  "worldnews": {
    "total": 1751,
    "deletes": 453,
    "keeps": 1298,
    "deletePercent": 25.871
  },
  "wholesomememes": {
    "total": 1641,
    "deletes": 1154,
    "keeps": 487,
    "deletePercent": 70.323
  },
  "WTF": {
    "total": 1619,
    "deletes": 758,
    "keeps": 861,
    "deletePercent": 46.819
  },
  "interestingasfuck": {
    "total": 1462,
    "deletes": 636,
    "keeps": 826,
    "deletePercent": 43.502
  },
  "movies": {
    "total": 1410,
    "deletes": 763,
    "keeps": 647,
    "deletePercent": 54.113
  },
  "news": {
    "total": 1392,
    "deletes": 303,
    "keeps": 1089,
    "deletePercent": 21.767
  },
  "The_Donald": {
    "total": 1362,
    "deletes": 193,
    "keeps": 1169,
    "deletePercent": 14.17
  },
  "OldSchoolCool": {
    "total": 1267,
    "deletes": 674,
    "keeps": 593,
    "deletePercent": 53.197
  },
  "me_irl": {
    "total": 1222,
    "deletes": 694,
    "keeps": 528,
    "deletePercent": 56.792
  },
  "science": {
    "total": 1178,
    "deletes": 508,
    "keeps": 670,
    "deletePercent": 43.124
  },
  "LifeProTips": {
    "total": 1133,
    "deletes": 900,
    "keeps": 233,
    "deletePercent": 79.435
  },
  ...
```

To see the full list, check out `./data/comment-body-stats.json`