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
3. Put the project URL and anon key (Project Settings › API) in `supabase.config.json`. The anon key is meant to be public; row-level security protects the data. Locally you can use `.env` instead (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), which overrides the file.
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
- **Prerendering:** every `vite build` runs `scripts/seo-plugin.mjs`, which reads the live services, posts and categories from Supabase and writes an HTML file per public page (title, description, canonical, Open Graph, JSON-LD and the page text) plus `sitemap.xml`. Google and link previews see full pages without running JavaScript; React takes over when the app loads. New or edited posts and services show up in the prerendered pages and sitemap on the next build/publish.
- `robots.txt` blocks `/admin`.
- **Old site redirects:** 203 URLs from the old WordPress site (recovered from the Wayback Machine) are mapped in `src/lib/legacy-redirects.json`. `public/_redirects` gives real 301s on hosts that read it (Netlify, Cloudflare Pages). On other hosts the app redirects them itself from the 404 page; for true 301s, put Cloudflare in front of the domain and import the same list as Bulk Redirects. Old blog posts redirect to the matching service page, or to `/blog/<same-slug>` once a post with that slug is published.

## Launch checklist

1. Supabase project created, migration and seed run, `supabase.config.json` filled in, first admin created.
2. Connect the repo in Lovable and publish; check a few pages (`/services/surveillance`, `/about`) with "view source" to confirm the prerendered text is there.
3. Confirm the phone number in Site settings ((214) 537-0191 on the old site vs (817) 933-7144), and the license numbers.
4. Point bringemininvestigations.com at the Lovable site and confirm SSL.
5. Test a few old URLs (for example `/skiptrace/`, `/about-us/`) redirect correctly; add Cloudflare redirects if the host doesn't send 301s.
6. Verify Google Search Console, submit `/sitemap.xml`, and update the website link on the Google Business Profile.

## Content still needed from the client

Anything shown in `[brackets]` in the seed data is a placeholder: PI license numbers, co-founder name and bios, photos, bail recovery fees and response times, counties served, and the privacy policy text.
