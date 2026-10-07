#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

npm run install:ci
node scripts/prepare-dashboard.mjs
npm run build
bash scripts/sites-env.sh -- node node_modules/wrangler/bin/wrangler.js types .wrangler/worker-runtime.d.ts --config dist/server/wrangler.json
bash scripts/sites-env.sh -- node node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --config dist/server/wrangler.json --local --persist-to "${PWD}/.wrangler/state" </dev/null
bash scripts/sites-env.sh -- node node_modules/typescript/bin/tsc --noEmit --incremental false --types node,./.wrangler/worker-runtime
