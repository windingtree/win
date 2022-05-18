#!/usr/bin/env bash

set -o errexit

echo "Emitting dispatch event \"release_to_npm\" for the win-stays repo";

curl \
  -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer $GITHUB_KEY" \
  https://api.github.com/repos/windingtree/win-stays/dispatches \
  -d "{\"event_type\":\"release_to_npm\", \"client_payload\": {\"packageName\": \"$1\"}}"
