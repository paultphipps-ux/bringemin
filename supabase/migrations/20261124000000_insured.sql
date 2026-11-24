-- "Licensed & insured" badge across the site; toggled in /admin/settings.
alter table public.site_settings add column if not exists insured boolean not null default true;
