-- Bring 'Em In Investigations: initial schema
-- Leads, bail bond skip submissions, CMS content, blog, media, roles and RLS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'editor');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role public.app_role,               -- null = no admin access
  created_at timestamptz not null default now()
);

create or replace function public.current_role_is(r public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = r);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role is not null);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role_is('admin');
$$;

-- New auth users get a profile row with no role; an admin grants a role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ---------------------------------------------------------------------------
-- Leads and skips (private: admins only read)
-- ---------------------------------------------------------------------------
create type public.lead_status as enum ('new', 'contacted', 'consult_booked', 'retained', 'lost');
create type public.skip_status as enum ('new', 'working', 'located', 'recovered', 'closed');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 200),
  contact_pref text check (contact_pref in ('call', 'text', 'email')),
  case_type text check (char_length(case_type) <= 100),
  message text check (char_length(message) <= 5000),
  source_page text check (char_length(source_page) <= 300),
  utm_source text, utm_medium text, utm_campaign text, gclid text,
  status public.lead_status not null default 'new',
  notes text
);

create table public.skip_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  bond_company text not null check (char_length(bond_company) between 1 and 200),
  agent_name text not null check (char_length(agent_name) between 1 and 200),
  agent_phone text not null check (char_length(agent_phone) <= 40),
  agent_email text check (char_length(agent_email) <= 200),
  defendant_name text not null check (char_length(defendant_name) between 1 and 200),
  defendant_dob date,
  bond_amount text check (char_length(bond_amount) <= 50),
  county text check (char_length(county) <= 100),
  last_known_address text check (char_length(last_known_address) <= 500),
  notes text check (char_length(notes) <= 5000),
  status public.skip_status not null default 'new',
  internal_notes text
);

-- ---------------------------------------------------------------------------
-- CMS content (public read, staff write)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Bring ''Em In Investigations',
  phone text not null default '(817) 933-7144',
  email text,
  license_number text,
  hours text default 'Available 24/7',
  service_area text default 'Dallas, Fort Worth and North Texas',
  address text,
  facebook_url text, instagram_url text, linkedin_url text, google_business_url text,
  default_seo_title text,
  default_seo_description text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

-- Editable blocks of copy on fixed pages, addressed by key (e.g. 'home.hero').
create table public.page_sections (
  key text primary key,
  page text not null,
  label text not null,
  eyebrow text,
  heading text,
  body text,
  image_url text,
  cta_label text,
  cta_href text,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  summary text,
  body text,                         -- HTML from the rich-text editor
  audience text check (audience in ('bail', 'attorney', 'individual', 'business')),
  image_url text,
  seo_title text, seo_description text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text,
  photo_url text,
  license_number text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,             -- name or initials
  context text,                     -- e.g. company or city
  audience text check (audience in ('bail', 'attorney', 'individual', 'business')),
  sort int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.case_results (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  service_id uuid references public.services (id) on delete set null,
  sort int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  page text not null default 'faq',  -- 'faq', 'bail', 'attorney', or a service slug
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create type public.post_status as enum ('draft', 'scheduled', 'published');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  excerpt text,
  body text not null default '',     -- HTML from the rich-text editor, sanitized on render
  cover_image_url text,
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_public_idx on public.posts (status, published_at desc);

create table public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  title text not null,
  body text not null,
  saved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Keep a revision every time a post's title or body changes.
create or replace function public.save_post_revision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and (old.title is distinct from new.title or old.body is distinct from new.body) then
    insert into public.post_revisions (post_id, title, body, saved_by)
    values (old.id, old.title, old.body, auth.uid());
  end if;
  return new;
end;
$$;
create trigger posts_revision before update on public.posts
  for each row execute function public.save_post_revision();

-- A post is publicly visible when published, or scheduled and its time has come.
create or replace function public.post_is_live(p public.posts)
returns boolean language sql stable as $$
  select p.status in ('published', 'scheduled') and p.published_at is not null and p.published_at <= now();
$$;

-- ---------------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,         -- path in the 'media' storage bucket
  url text not null,
  alt text,
  width int, height int,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger t_site_settings before update on public.site_settings for each row execute function public.touch_updated_at();
create trigger t_page_sections before update on public.page_sections for each row execute function public.touch_updated_at();
create trigger t_services before update on public.services for each row execute function public.touch_updated_at();
create trigger t_posts before update on public.posts for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.skip_submissions enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_sections enable row level security;
alter table public.services enable row level security;
alter table public.team_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.case_results enable row level security;
alter table public.faqs enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_revisions enable row level security;
alter table public.media enable row level security;

-- profiles: see your own; admins see and manage all
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admins manage profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- leads / skips: anyone may submit; only admins read or change (editors cannot see client data)
create policy "public can submit leads" on public.leads for insert to anon, authenticated with check (status = 'new' and notes is null);
create policy "admins read leads" on public.leads for select using (public.is_admin());
create policy "admins update leads" on public.leads for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete leads" on public.leads for delete using (public.is_admin());

create policy "public can submit skips" on public.skip_submissions for insert to anon, authenticated with check (status = 'new' and internal_notes is null);
create policy "admins read skips" on public.skip_submissions for select using (public.is_admin());
create policy "admins update skips" on public.skip_submissions for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete skips" on public.skip_submissions for delete using (public.is_admin());

-- content tables: public reads published rows, staff read all and write
create policy "public read settings" on public.site_settings for select using (true);
create policy "admins edit settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

create policy "public read sections" on public.page_sections for select using (true);
create policy "staff write sections" on public.page_sections for all using (public.is_staff()) with check (public.is_staff());

create policy "public read services" on public.services for select using (published or public.is_staff());
create policy "staff write services" on public.services for all using (public.is_staff()) with check (public.is_staff());

create policy "public read team" on public.team_members for select using (published or public.is_staff());
create policy "staff write team" on public.team_members for all using (public.is_staff()) with check (public.is_staff());

create policy "public read testimonials" on public.testimonials for select using (published or public.is_staff());
create policy "staff write testimonials" on public.testimonials for all using (public.is_staff()) with check (public.is_staff());

create policy "public read case results" on public.case_results for select using (published or public.is_staff());
create policy "staff write case results" on public.case_results for all using (public.is_staff()) with check (public.is_staff());

create policy "public read faqs" on public.faqs for select using (published or public.is_staff());
create policy "staff write faqs" on public.faqs for all using (public.is_staff()) with check (public.is_staff());

create policy "public read categories" on public.categories for select using (true);
create policy "staff write categories" on public.categories for all using (public.is_staff()) with check (public.is_staff());

create policy "public read live posts" on public.posts for select
  using ((status in ('published', 'scheduled') and published_at is not null and published_at <= now()) or public.is_staff());
create policy "staff write posts" on public.posts for all using (public.is_staff()) with check (public.is_staff());

create policy "staff read revisions" on public.post_revisions for select using (public.is_staff());

create policy "public read media" on public.media for select using (true);
create policy "staff write media" on public.media for all using (public.is_staff()) with check (public.is_staff());

-- storage: public bucket for reads; only staff upload, change or delete
create policy "staff upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
create policy "staff update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff());
create policy "staff delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_staff());
