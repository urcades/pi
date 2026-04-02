#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Building packages/tui"
(
	cd "$REPO_ROOT/packages/tui"
	../../node_modules/.bin/tsgo -p tsconfig.build.json
)

echo "==> Building packages/ai"
(
	cd "$REPO_ROOT/packages/ai"
	../../node_modules/.bin/tsgo -p tsconfig.build.json
)

echo "==> Building packages/coding-agent"
(
	cd "$REPO_ROOT/packages/coding-agent"
	../../node_modules/.bin/tsgo -p tsconfig.build.json
	chmod +x dist/cli.js
	npm run copy-assets
)

echo "==> Rebuild complete"
