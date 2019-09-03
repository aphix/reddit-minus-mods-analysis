# /r/RedditMinusMods Analysis & Data

[See this post for initial data and ongoing conversation](https://www.reddit.com/r/RedditMinusMods/comments/cwvf8a/a_rredditminusmods_user_requested_a_graph_of_the/)

Note: WIP, probably incomplete data, and probably some edge-cases missed. Feel free to submit PR.

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

## Generated Files

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