# Ballon d'Or Vote

A mobile-friendly private poll for the boys, styled like a live prediction market. Each browser receives an anonymous Supabase session and can hold one vote. A voter can change that vote at any time.

## Why the database is not stored in GitHub

GitHub Pages only serves static HTML, CSS, and JavaScript, so it cannot run a database or securely accept writes. The site uses a tiny free Supabase table for shared totals. When Supabase is not configured, it automatically runs in local demo mode.

## 1. Create the shared database

1. Create a free project at https://supabase.com/.
2. In Authentication → Providers, enable Anonymous Sign-Ins.
3. Open SQL Editor, paste the contents of sql/setup.sql, and run it.
4. Open the project's API settings and copy:
   - the project URL;
   - the publishable key beginning with sb_publishable_. Never use the service_role key in this site.

The SQL enables Row Level Security: everyone can see the totals, but each anonymous user can only insert or update their own vote.

## 2. Test locally

    cp .env.example .env.local
    # Replace both placeholder values in .env.local
    npm install
    npm run dev

Without .env.local, the site still opens in demo mode and stores one test vote in the browser.

## 3. Publish on GitHub Pages

1. Create a GitHub repository and upload this project.
2. In Settings → Secrets and variables → Actions → Variables, add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
3. In Settings → Pages, choose GitHub Actions as the source.
4. Push to main. The included workflow builds and publishes the site automatically.

## Change the names or text

Edit app/vote-config.ts. The candidate images are in public/assets/.

## Practical limits

This is a friendly poll, not an election system. Anonymous sessions prevent accidental duplicate votes on one browser, but someone can vote again from another device or after clearing browser storage.
