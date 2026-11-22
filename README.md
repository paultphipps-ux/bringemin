# Bring 'Em In Investigations website

Public site and admin CMS for bringemininvestigations.com, a licensed private investigation agency in Dallas, TX.

**Stack:** Vite + React + TypeScript + Tailwind (Lovable-compatible), Supabase (Postgres, Auth, Storage, Edge Functions), TipTap rich-text editor.

## What's here

| Area | Routes |
| --- | --- |
| Public site | `/`, `/services`, `/services/:slug`, `/bail-bond-agents`, `/attorneys`, `/about`, `/faq`, `/contact`, `/blog`, `/blog/:slug`, `/blog/category/:slug`, `/privacy` |
| Admin (login required) | `/admin` dashboard, leads, skips, blog posts + editor, categories, page content, services, team, testimonials, FAQs, media library, site settings, users |

Every piece of copy visitors see (headlines, services, team, testimonials, FAQs, contact details, blog posts) comes from Supabase and is editable in `/admin`. Only layout lives in code.

### Admin roles

- **Admin:** everything, including leads, skips, site settings and users.
- **Editor:** content and blog only. Cannot see leads or skips (enforced by row-level security, not just hidden menus).

### Blog

WordPress-style: drafts with autosave, scheduled publishing (a post goes live when its publish date passes), categories, cover images from the media library, per-post SEO title/description/social image with a Google preview, and revision history with restore (a revision is saved on every title/body change).

## Setup

1. Create a Supabase project.
2. Run the migration and seed, either with the Supabase CLI (`supabase link` then `supabase db push` and `psql … -f supabase/seed.sql`) or by pasting `supabase/migrations/20261122000000_init.sql` and then `supabase/seed.sql` into the SQL editor.
3. `cp .env.example .env` and fill in the project URL and anon key.
4. `npm install && npm run dev`.
5. Create the first admin: in Supabase, Authentication › Users › Add user (or invite), then in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'owner@example.com';
   ```
   After that, admins grant access to others from `/admin/users`.

### Lead alerts (optional)

`supabase/functions/notify-new-lead` emails the owner "New inquiry" / "New skip submitted" with a link to the admin, and deliberately no case details. Deploy it, set its secrets (see the header comment in the file), and add Database Webhooks on INSERT for `leads` and `skip_submissions` that send the `x-webhook-secret` header.

## SEO notes

- Each page sets its own title, description, canonical URL and JSON-LD (LocalBusiness, Service, FAQPage, BlogPosting) via `react-helmet-async`.
- `npm run build` regenerates `public/sitemap.xml` from live services and posts (`scripts/generate-sitemap.mjs`). `robots.txt` blocks `/admin`.
- This is a client-rendered single-page app. Google can render JavaScript, but for the blog and service pages to rank reliably, add prerendering or SSR before launch (for example a prerender step for the public routes, or hosting behind a prerender service).
- When the old site's URLs are recovered, add 301 redirects for each one to its new page at the host or CDN level.

## Content still needed from the client

Anything shown in `[brackets]` in the seed data is a placeholder: PI license numbers, co-founder name and bios, photos, real testimonials, bail recovery fees and response times, counties served, and the privacy policy text.
