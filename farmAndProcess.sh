#!/bin/bash

set -e

echo "Farming..."

node src/farm.js

echo "Combining full comments (./data/comment-full/*.json -> ./data/comments-combined.json)"
cat ./data/comment-full/*.json | jq -s . > ./data/comments-combined.json

echo "Processing..."
node src/process.js

echo "Combining processed comments (./data/comment-body/*.json -> ./data/processed-combined.json)"
cat ./data/comment-body/*.json | jq -s . > ./data/processed-combined.json

echo "Combining & flattening processed comments (./data/comment-body/*.json -> ./data/processed-combined-flat.json)"
cat ./data/comment-body/*.json | jq -s '.|flatten' > ./data/processed-combined-flat.json

echo "Done!"