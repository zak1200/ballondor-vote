# Ballon d'Or Vote

The repository and environment keep their original name. The current website is an English, pharmacy-themed letter for Zainab: **Zainab’s Pharmacy**.

The public website was taken offline at the owner's request. GitHub Pages now serves only a minimal offline notice. The shutdown workflow does not upload the letter or photograph and does not automatically enable Pages. The available credentials could not fully unpublish Pages; the repository owner can do that under **Settings → Pages → Unpublish site**. Restoring the personal website requires deliberately restoring its deployment workflow.

It includes Sunday’s flowers, Zainab’s photo, and conversation; an expandable personal letter; a Yes button; and a playful moving “No”. Keyboard activation and reduced-motion preferences make the playful button behave like a normal No. The Worker version explains that choices are saved before the visitor answers; the GitHub Pages version explains that answers are not sent.

## Cloud development

Requirements: Linux, Node.js 22.13 or newer, npm, Python 3, curl, flock, GNU timeout, and sha256sum. Each cloud task is already isolated: use the existing checkout, without creating a Git worktree.

From `/workspace/ballondor-vote`:

```sh
bash scripts/cloud-setup.sh
bash scripts/sites-env.sh -- npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Setup uses the locked dependencies and preserves their integrity checks. It builds the Cloudflare Worker, generates its runtime types, applies migrations to the local D1 database, and checks TypeScript. Repeating setup preserves the database and existing dashboard key.

The generated, ignored `.dev.vars` file contains `ZAINAB_ADMIN_KEY`. Open that file privately to obtain the access key, then enter it at `/responses`. The key is not included in browser code, URLs, or logs. The dashboard shows the latest 200 interactions, grouped by an anonymous visit identifier, with timestamps. Visits do not prove a visitor’s identity. No email notification is configured.

The local database lives in `.wrangler/state`; processes must restart in each new task. Do not delete that directory to restart the website. Supabase, account creation, and an external database are unnecessary for local development.

## Validation

```sh
npm test
npm run lint
bash scripts/sites-env.sh -- node node_modules/typescript/bin/tsc --noEmit --incremental false --types node,./.wrangler/worker-runtime
```

`npm test` builds the site and runs ten tests. Worker tests use independent, temporary D1 databases and a test-only access key, so they do not pollute the real dashboard. They check page rendering, dashboard privacy, input validation, choice persistence, retry deduplication, and the existing UI components.

## Sharing the website

The website needs a Cloudflare-compatible Worker runtime, a D1 binding named `DB`, the migrations in `drizzle/`, and a private runtime secret named `ZAINAB_ADMIN_KEY` (at least 24 characters). Configure a separate production key through the hosting service’s secret settings; do not commit or publish `.dev.vars`.

GitHub Pages hosts a separate static version of the public letter and interactive buttons. The Pages version clearly explains that answers are not recorded or sent; Zainab can tell you her answer privately. The private response dashboard remains available in the Worker version.

Build Pages locally with `bash scripts/sites-env.sh -- node scripts/build-pages.mjs`; the output is `out/pages`. The public deployment workflow is disabled for the personal site and handles shutdown instead. The former Pages address is `https://zak1200.github.io/ballondor-vote/`.

Publishing this Codex development environment is separate from deploying a public website. The cloud setup script prepares the local Worker and database, without creating a remote database.

Personal text is in `app/zainab-page.tsx`, styling in `app/globals.css`, the dashboard in `app/responses/page.tsx`, and the response API in `app/api/responses/route.ts`.
