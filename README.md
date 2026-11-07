# Ashes of Hearts Characters — Supabase version

## Included
- Dark, minimal responsive character archive.
- Shared Supabase database instead of browser localStorage.
- Public read, create, and edit without sign-in.
- No public delete control or DELETE permission.
- Portraits use external image URLs.

## Important
The browser uses the Supabase Project URL and Publishable key. A publishable key is designed to be exposed in client-side code. Never put a Supabase secret/service_role key or database password in this project.

Public editing is intentionally open: anyone who can reach the site can edit any character. There is no account-based attribution, moderation, or undo in this version. Keep a database backup/export periodically. Do not grant public DELETE.

## Setup
1. In Supabase SQL Editor, run `supabase/setup.sql`.
   - It creates the table if missing, adds the fields used by this site, and configures public SELECT/INSERT/UPDATE RLS policies.
   - It deliberately does not create a public DELETE policy.
2. Keep `index.html`, `styles.css`, `app.js`, and `logo.png` in the same folder.
3. Replace the previous site's files with these files.
4. Open the site. The status under the title should say "Общая база подключена".

## Portrait URLs
Use a direct image URL that ends in an image extension or otherwise returns the image itself. A normal Imgur/prnt.sc webpage URL may not display as an image; use its direct image address instead.

## GitHub Pages
Upload the files in this folder to the root of your GitHub repository and enable Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
