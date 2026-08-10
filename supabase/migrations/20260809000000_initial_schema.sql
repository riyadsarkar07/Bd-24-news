-- ================================================================
-- BD24News CMS — complete Supabase migration
-- Project: pvqtsaiccfweearaltgo
-- Run: Supabase Dashboard > SQL Editor > paste > Run
-- This creates the full CMS schema, enables RLS, secures storage,
-- and seeds the existing demo/news content without duplicates.
-- ================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- updated_at helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Admin helper: only the two authorized admin UIDs
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() in ('905e2a90-3e47-40ca-ad98-57d7d1fbd319', '304673b9-c910-4e3f-864c-155f3d743e64');
$$;

-- ================================================================
-- articles
-- ================================================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  title_bn text not null default '',
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'bangladesh',
  category_color text not null default '#E50914',
  tags jsonb not null default '[]'::jsonb,
  author text not null default '',
  author_name_bn text not null default '',
  author_slug text not null default '',
  author_avatar text not null default '',
  author_role text not null default 'Editor',
  cover_image text not null default '',
  images jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  views bigint not null default 0,
  likes bigint not null default 0,
  comments_count bigint not null default 0,
  reading_minutes integer not null default 1,
  featured boolean not null default false,
  breaking boolean not null default false,
  trending boolean not null default false,
  editor_pick boolean not null default false,
  is_video boolean not null default false,
  is_gallery boolean not null default false,
  video_url text,
  location text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  status text not null default 'draft' check (status in ('published', 'draft'))
);
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_category_idx on public.articles(category);
create or replace trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();

-- ================================================================
-- categories
-- ================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null default '',
  name_bn text not null default '',
  color text not null default '#E50914',
  status text not null default 'active' check (status in ('active', 'inactive')),
  menu boolean not null default false,
  featured boolean not null default false,
  updated_at timestamptz not null default now()
);
create or replace trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();

-- ================================================================
-- tags
-- ================================================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  trending boolean not null default false,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);
create or replace trigger tags_set_updated_at before update on public.tags for each row execute function public.set_updated_at();

-- ================================================================
-- authors
-- ================================================================
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null default '',
  name_bn text not null default '',
  role text not null default '',
  email text not null default '',
  bio text not null default '',
  avatar text not null default '',
  cover text not null default '',
  followers bigint not null default 0,
  articles_count integer not null default 0,
  verified boolean not null default false,
  active boolean not null default true,
  social jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create or replace trigger authors_set_updated_at before update on public.authors for each row execute function public.set_updated_at();

-- ================================================================
-- profiles (application users; admin UIDs are seeded)
-- ================================================================
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  name text not null default '',
  avatar text not null default '',
  role text not null default 'Subscriber',
  status text not null default 'active' check (status in ('active', 'banned', 'pending')),
  joined_at timestamptz not null default now(),
  last_active timestamptz,
  posts bigint not null default 0,
  updated_at timestamptz not null default now()
);
create or replace trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- ================================================================
-- roles
-- ================================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  permissions jsonb not null default '[]'::jsonb,
  system boolean not null default false,
  users bigint not null default 0,
  updated_at timestamptz not null default now()
);
create or replace trigger roles_set_updated_at before update on public.roles for each row execute function public.set_updated_at();

-- ================================================================
-- comments
-- ================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  article_title text not null default '',
  author text not null default 'Anonymous',
  avatar text not null default '',
  content text not null,
  created_at timestamptz not null default now(),
  likes bigint not null default 0,
  status text not null default 'published' check (status in ('published', 'pending', 'spam')),
  updated_at timestamptz not null default now()
);
create index if not exists comments_article_id_idx on public.comments(article_id);
create or replace trigger comments_set_updated_at before update on public.comments for each row execute function public.set_updated_at();

-- ================================================================
-- subscribers
-- ================================================================
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  source text not null default 'Website form',
  status text not null default 'active' check (status in ('active', 'inactive')),
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace trigger subscribers_set_updated_at before update on public.subscribers for each row execute function public.set_updated_at();

-- ================================================================
-- newsletters
-- ================================================================
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject_bn text not null default '',
  subject_en text not null default '',
  body text not null default '',
  sent_at timestamptz,
  opens bigint not null default 0,
  clicks bigint not null default 0,
  recipients bigint not null default 0,
  status text not null default 'draft' check (status in ('sent', 'scheduled', 'draft')),
  updated_at timestamptz not null default now()
);
create or replace trigger newsletters_set_updated_at before update on public.newsletters for each row execute function public.set_updated_at();

-- ================================================================
-- advertisements
-- ================================================================
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position text not null default '',
  size text not null default '',
  type text not null default 'banner' check (type in ('banner', 'sidebar', 'inline', 'native')),
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  ctr numeric not null default 0,
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  updated_at timestamptz not null default now()
);
create or replace trigger ads_set_updated_at before update on public.ads for each row execute function public.set_updated_at();

-- ================================================================
-- settings (key/value; keys 'general' and 'seo')
-- ================================================================
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create or replace trigger settings_set_updated_at before update on public.settings for each row execute function public.set_updated_at();

-- ================================================================
-- backups
-- ================================================================
create table if not exists public.backups (
  id text primary key,
  label text not null default 'Full site backup',
  created_at timestamptz not null default now(),
  size text not null default '',
  collections jsonb not null default '[]'::jsonb,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ================================================================
-- media (metadata for Supabase Storage uploads)
-- ================================================================
create table if not exists public.media (
  id text primary key,
  name text not null default 'untitled',
  src text not null default '',
  type text not null default 'image',
  size bigint not null default 0,
  size_label text not null default '',
  path text not null default '',
  uploaded_at timestamptz not null default now(),
  used_in text not null default '',
  updated_at timestamptz not null default now()
);
create or replace trigger media_set_updated_at before update on public.media for each row execute function public.set_updated_at();

-- ================================================================
-- meta (initialization marker)
-- ================================================================
create table if not exists public.meta (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now()
);


-- ================================================================
-- Row Level Security
-- Public read: published articles + public content.
-- Write: only the two admin UIDs via public.is_admin().
-- ================================================================

alter table public.articles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.authors enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.comments enable row level security;
alter table public.subscribers enable row level security;
alter table public.newsletters enable row level security;
alter table public.ads enable row level security;
alter table public.settings enable row level security;
alter table public.backups enable row level security;
alter table public.media enable row level security;
alter table public.meta enable row level security;

-- articles: public can read published; only admins write
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select using (status = 'published' or public.is_admin());
drop policy if exists articles_admin_insert on public.articles;
create policy articles_admin_insert on public.articles for insert with check (public.is_admin());
drop policy if exists articles_admin_update on public.articles;
create policy articles_admin_update on public.articles for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists articles_admin_delete on public.articles;
create policy articles_admin_delete on public.articles for delete using (public.is_admin());

-- categories / tags / authors: public read, admin write
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists tags_public_read on public.tags;
create policy tags_public_read on public.tags for select using (true);
drop policy if exists tags_admin_write on public.tags;
create policy tags_admin_write on public.tags for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists authors_public_read on public.authors;
create policy authors_public_read on public.authors for select using (true);
drop policy if exists authors_admin_write on public.authors;
create policy authors_admin_write on public.authors for all using (public.is_admin()) with check (public.is_admin());

-- profiles: admin manages; users may read/update their own profile
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (public.is_admin() or auth.uid() = id);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (public.is_admin() or auth.uid() = id) with check (public.is_admin() or auth.uid() = id);
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete using (public.is_admin());

-- roles / newsletters / backups: admin only
drop policy if exists roles_admin_all on public.roles;
create policy roles_admin_all on public.roles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists newsletters_admin_all on public.newsletters;
create policy newsletters_admin_all on public.newsletters for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists backups_admin_all on public.backups;
create policy backups_admin_all on public.backups for all using (public.is_admin()) with check (public.is_admin());

-- comments: public read + post; admin moderates
drop policy if exists comments_public_read on public.comments;
create policy comments_public_read on public.comments for select using (true);
drop policy if exists comments_public_insert on public.comments;
create policy comments_public_insert on public.comments for insert with check (true);
drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update on public.comments for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete on public.comments for delete using (public.is_admin());

-- subscribers: public may subscribe (valid email); admin manages
drop policy if exists subscribers_admin_read on public.subscribers;
create policy subscribers_admin_read on public.subscribers for select using (public.is_admin());
drop policy if exists subscribers_public_insert on public.subscribers;
create policy subscribers_public_insert on public.subscribers for insert with check (email ~* '^[^@]+@[^@]+$');
drop policy if exists subscribers_admin_update on public.subscribers;
create policy subscribers_admin_update on public.subscribers for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists subscribers_admin_delete on public.subscribers;
create policy subscribers_admin_delete on public.subscribers for delete using (public.is_admin());

-- ads: admin only
drop policy if exists ads_admin_all on public.ads;
create policy ads_admin_all on public.ads for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read (site config), admin write
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select using (true);
drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- media: public read (image URLs), admin manage
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);
drop policy if exists media_admin_insert on public.media;
create policy media_admin_insert on public.media for insert with check (public.is_admin());
drop policy if exists media_admin_update on public.media;
create policy media_admin_update on public.media for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists media_admin_delete on public.media;
create policy media_admin_delete on public.media for delete using (public.is_admin());

-- meta: public read, admin write
drop policy if exists meta_public_read on public.meta;
create policy meta_public_read on public.meta for select using (true);
drop policy if exists meta_admin_write on public.meta;
create policy meta_admin_write on public.meta for all using (public.is_admin()) with check (public.is_admin());


-- ================================================================
-- Storage: 'media' bucket (public read) + admin-only uploads
-- ================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media_admin_insert" on storage.objects;
create policy media_admin_insert on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_update" on storage.objects;
create policy media_admin_update on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_delete" on storage.objects;
create policy media_admin_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());


-- ================================================================
-- Seed: existing demo/news content (idempotent, no duplicates)
-- ================================================================

insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('bangladesh', 'Bangladesh', 'বাংলাদেশ', '#E50914', 'active', true, true)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('international', 'International', 'আন্তর্জাতিক', '#2563EB', 'active', true, true)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('politics', 'Politics', 'রাজনীতি', '#7C3AED', 'active', true, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('economy', 'Economy', 'অর্থনীতি', '#059669', 'active', true, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('sports', 'Sports', 'খেলাধুলা', '#22C55E', 'active', true, true)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('entertainment', 'Entertainment', 'বিনোদন', '#F59E0B', 'active', true, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('technology', 'Technology', 'প্রযুক্তি', '#0891B2', 'active', true, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('education', 'Education', 'শিক্ষা', '#F97316', 'active', true, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('health', 'Health', 'স্বাস্থ্য', '#EF4444', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('lifestyle', 'Lifestyle', 'লাইফস্টাইল', '#EC4899', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('opinion', 'Opinion', 'মতামত', '#64748B', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('crime', 'Crime', 'অপরাধ', '#18181B', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('religion', 'Religion', 'ধর্ম', '#16A34A', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('travel', 'Travel', 'ভ্রমণ', '#0EA5E9', 'active', false, false)
on conflict (slug) do nothing;
insert into public.categories (slug, name, name_bn, color, status, menu, featured)
values ('jobs', 'Jobs', 'চাকরি', '#6366F1', 'active', false, false)
on conflict (slug) do nothing;
insert into public.roles (slug, name, description, permissions, system, users)
values ('admin', 'Administrator', 'Full access to everything', '["*"]'::jsonb, true, 0)
on conflict (slug) do nothing;
insert into public.roles (slug, name, description, permissions, system, users)
values ('editor', 'Editor', 'Manage content, approve comments', '["news:write","news:publish","comments:moderate","media:manage"]'::jsonb, true, 0)
on conflict (slug) do nothing;
insert into public.roles (slug, name, description, permissions, system, users)
values ('journalist', 'Journalist', 'Write and submit articles', '["news:write","media:upload"]'::jsonb, true, 0)
on conflict (slug) do nothing;
insert into public.roles (slug, name, description, permissions, system, users)
values ('subscriber', 'Subscriber', 'Read articles and comment', '["read","comment"]'::jsonb, true, 0)
on conflict (slug) do nothing;
insert into public.profiles (id, email, name, avatar, role, status, joined_at, last_active, posts)
values ('304673b9-c910-4e3f-864c-155f3d743e64', 'bd24news@tensi.org', 'bd24news', '', 'Admin', 'active', now(), now(), 0)
on conflict (id) do nothing;
insert into public.profiles (id, email, name, avatar, role, status, joined_at, last_active, posts)
values ('905e2a90-3e47-40ca-ad98-57d7d1fbd319', 'riyadsarkar1243@gmail.com', 'riyadsarkar1243', '', 'Admin', 'active', now(), now(), 0)
on conflict (id) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('tanvir-rahman', 'Tanvir Rahman', 'তানভীর রহমান', 'Chief Editor', 'tanvir@bd24news.com', 'তানভীর রহমান বিডি২৪নিউজের প্রধান সম্পাদক। দুই দশকেরও বেশি সময় ধরে সাংবাদিকতায় যুক্ত। ঢাকা বিশ্ববিদ্যালয় থেকে গণযোগাযোগে স্নাতক।', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80&auto=format&fit=crop', 152000, 1240, true, true, '{"facebook":"tanvir.rahman","twitter":"tanvirrahman","linkedin":"tanvir-rahman"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('nusrat-jahan', 'Nusrat Jahan', 'নুসরাত জাহান', 'Senior Reporter', 'nusrat@bd24news.com', 'নুসরাত জাহান রাজনীতি ও অর্থনীতি বিষয়ে লেখেন। রাজশাহী বিশ্ববিদ্যালয় থেকে অর্থনীতিতে স্নাতকোত্তর।', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1600&q=80&auto=format&fit=crop', 88000, 760, true, true, '{"facebook":"nusrat.jahan","twitter":"nusratjahan"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('arif-chowdhury', 'Arif Chowdhury', 'আরিফ চৌধুরী', 'Sports Editor', 'arif@bd24news.com', 'আরিফ চৌধুরী খেলাধুলা ডেস্কের সম্পাদক। ক্রিকেট নিয়ে লেখার পাশাপাশি ফুটবলও কভার করেন।', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&q=80&auto=format&fit=crop', 204000, 980, true, true, '{"facebook":"arif.chowdhury","twitter":"arifsports"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('sadia-islam', 'Sadia Islam', 'সাদিয়া ইসলাম', 'Technology Writer', 'sadia@bd24news.com', 'সাদিয়া ইসলাম প্রযুক্তি ও স্টার্টআপ নিয়ে লেখেন। বুয়েট থেকে কম্পিউটার প্রকৌশলে স্নাতক।', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop', 66000, 520, true, true, '{"twitter":"sadiatech","linkedin":"sadia-islam"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('rakib-hassan', 'Rakib Hassan', 'রাকিব হাসান', 'International Correspondent', 'rakib@bd24news.com', 'রাকিব হাসান আন্তর্জাতিক ডেস্কের সংবাদদাতা। দক্ষিণ এশিয়া ও মধ্যপ্রাচ্য কভার করেন।', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1489516407517-16ae8ff9232d?w=1600&q=80&auto=format&fit=crop', 45000, 410, true, true, '{"twitter":"rakibintl"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('mim-akter', 'Mim Akter', 'মিম আক্তার', 'Entertainment Reporter', 'mim@bd24news.com', 'মিম আক্তার বিনোদন ডেস্কের প্রতিবেদক। চলচ্চিত্র ও সংস্কৃতি নিয়ে লেখেন।', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80&auto=format&fit=crop', 128000, 690, true, true, '{"facebook":"mim.akter","instagram":"mimakter"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('fahim-kabir', 'Fahim Kabir', 'ফাহিম কবির', 'Health Columnist', 'fahim@bd24news.com', 'ফাহিম কবির স্বাস্থ্য ও চিকিৎসা বিষয়ে লেখেন। বঙ্গবন্ধু শেখ মুজিব মেডিক্যাল বিশ্ববিদ্যালয়ের চিকিৎসক।', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1600&q=80&auto=format&fit=crop', 39000, 340, true, true, '{"twitter":"drfahim"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('isha-khan', 'Isha Khan', 'ইশা খান', 'Lifestyle Writer', 'isha@bd24news.com', 'ইশা খান লাইফস্টাইল ও ভ্রমণ নিয়ে লেখেন। সংস্কৃতি ও খাবারের প্রতি গভীর আগ্রহ।', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop', 72000, 480, true, true, '{"facebook":"isha.khan","instagram":"ishawanders"}'::jsonb)
on conflict (slug) do nothing;
insert into public.authors (slug, name, name_bn, role, email, bio, avatar, cover, followers, articles_count, verified, active, social)
values ('mehedi-hasan', 'Mehedi Hasan', 'মেহেদী হাসান', 'Photojournalist', 'mehedi@bd24news.com', 'মেহেদী হাসান ফটোসাংবাদিক। তার ছবি দেশি-বিদেশি পত্রিকায় প্রকাশিত হয়েছে।', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80&auto=format&fit=crop', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80&auto=format&fit=crop', 51000, 260, false, true, '{"instagram":"mehedi.frames"}'::jsonb)
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('metro-extended-line', 'Dhaka Metro Rail Extends Line to Motijheel, First Test Run Today', 'ঢাকা মেট্রোরেলের নতুন রুট উদ্বোধন, মতিঝিল পর্যন্ত পরীক্ষামূলক চালু', 'After weeks of anticipation, the Dhaka Metro Rail today completed its first test run on the extended line from Agargaon to Motijheel, marking a historic milestone for public transport in the capital.', 'ঢাকা, Dhaka Metro Rail Extends Line to Motijheel, First Test Run Today। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["metro","transport","dhaka"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T06:47:00+06:00'::timestamptz, '2026-08-01T06:47:00+06:00'::timestamptz, 152000, 4200, 74, 4, true, true, true, true, false, false, null, 'ঢাকা', 'ঢাকা মেট্রোরেলের নতুন রুট উদ্বোধন, মতিঝিল পর্যন্ত পরীক্ষামূলক চালু | BD24News', 'After weeks of anticipation, the Dhaka Metro Rail today completed its first test run on the extended line from Agargaon to Motijheel, marking a historic milestone for public transport in the capital.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('bb-governor-new', 'Dr. Ahsanul Kabir Takes Charge as New Bangladesh Bank Governor', 'বাংলাদেশ ব্যাংকের নতুন গভর্নর হিসেবে দায়িত্ব নিলেন ড. এহসানুল কবির', 'The new governor of Bangladesh Bank has officially assumed office today, vowing to stabilise inflation, strengthen reserves and accelerate digital banking adoption across the country.', 'ঢাকা, Dr. Ahsanul Kabir Takes Charge as New Bangladesh Bank Governor। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["bangladesh-bank","economy","finance"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T13:08:00+06:00'::timestamptz, '2026-08-02T13:08:00+06:00'::timestamptz, 98000, 3100, 30, 5, true, true, true, true, false, false, null, 'ঢাকা', 'বাংলাদেশ ব্যাংকের নতুন গভর্নর হিসেবে দায়িত্ব নিলেন ড. এহসানুল কবির | BD24News', 'The new governor of Bangladesh Bank has officially assumed office today, vowing to stabilise inflation, strengthen reserves and accelerate digital banking adoption across the country.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('tigers-vs-afghanistan', 'Tigers Face Afghanistan in Crucial World Cup Qualifier Tonight', 'বিশ্বকাপ বাছাইয়ে টাইগারদের আজ মুখোমুখি আফগানিস্তান', 'Bangladesh take on Afghanistan in a must-win World Cup qualifier tonight. A victory would put the Tigers on the brink of a historic World Cup appearance.', 'ঢাকা, Tigers Face Afghanistan in Crucial World Cup Qualifier Tonight। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'sports', '#22C55E', '["cricket","world-cup","tigers"]'::jsonb, 'Arif Chowdhury', 'আরিফ চৌধুরী', 'arif-chowdhury', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', 'Sports Editor', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T08:37:00+06:00'::timestamptz, '2026-08-05T08:37:00+06:00'::timestamptz, 234000, 8600, 112, 6, true, true, true, true, false, false, null, 'ঢাকা', 'বিশ্বকাপ বাছাইয়ে টাইগারদের আজ মুখোমুখি আফগানিস্তান | BD24News', 'Bangladesh take on Afghanistan in a must-win World Cup qualifier tonight. A victory would put the Tigers on the brink of a historic World Cup appearance.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('air-pollution-dhaka', 'Dhaka Tops Air Pollution Charts Again, Residents Demand Action', 'ঢাকায় বায়ুদূষণ: আবারও দূষিত বাতাসে শীর্ষে রাজধানী', 'Air quality in Dhaka worsened again this week, topping global pollution charts for the fifth consecutive day. Experts blame construction dust, brick kilns and vehicle emissions.', 'ঢাকা, Dhaka Tops Air Pollution Charts Again, Residents Demand Action। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["pollution","environment","health"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T06:05:00+06:00'::timestamptz, '2026-08-01T06:05:00+06:00'::timestamptz, 87000, 2200, 59, 5, true, false, true, false, false, false, null, 'ঢাকা', 'ঢাকায় বায়ুদূষণ: আবারও দূষিত বাতাসে শীর্ষে রাজধানী | BD24News', 'Air quality in Dhaka worsened again this week, topping global pollution charts for the fifth consecutive day. Experts blame construction dust, brick kilns and vehicle emissions.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('gold-price-record', 'Gold Prices Hit New Record at Tk 127,450 per Bhori', 'সোনার দামে আবারও রেকর্ড, ভরিতে ১ লাখ ২৭ হাজার টাকা', 'Gold prices in Bangladesh touched another historic high today, rising Tk 1,150 per bhori amid a global rally in the yellow metal. Jewellers say demand remains steady ahead of the wedding season.', 'ঢাকা, Gold Prices Hit New Record at Tk 127,450 per Bhori। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["gold","market","price"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T22:38:00+06:00'::timestamptz, '2026-08-02T22:38:00+06:00'::timestamptz, 45000, 1800, 10, 4, false, false, true, false, false, false, null, 'ঢাকা', 'সোনার দামে আবারও রেকর্ড, ভরিতে ১ লাখ ২৭ হাজার টাকা | BD24News', 'Gold prices in Bangladesh touched another historic high today, rising Tk 1,150 per bhori amid a global rally in the yellow metal. Jewellers say demand remains steady ahead of the wedding season.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('gaza-ceasefire', 'Gaza Ceasefire Takes Effect, First Aid Convoy Enters', 'গাজায় যুদ্ধবিরতি চুক্তি কার্যকর, প্রথম ত্রাণ কনভয় প্রবেশ করেছে', 'A fragile ceasefire between Israel and Hamas took effect this morning. The first humanitarian aid convoy carrying food and medicine entered the enclave amid cautious hopes for lasting peace.', 'ঢাকা, Gaza Ceasefire Takes Effect, First Aid Convoy Enters। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'international', '#2563EB', '["gaza","israel","middle-east"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T12:45:00+06:00'::timestamptz, '2026-08-05T12:45:00+06:00'::timestamptz, 312000, 9200, 111, 6, true, true, true, true, false, false, null, 'ঢাকা', 'গাজায় যুদ্ধবিরতি চুক্তি কার্যকর, প্রথম ত্রাণ কনভয় প্রবেশ করেছে | BD24News', 'A fragile ceasefire between Israel and Hamas took effect this morning. The first humanitarian aid convoy carrying food and medicine entered the enclave amid cautious hopes for lasting peace.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('ai-translate-bangla', 'Bangla AI Translation Models Now Beat Google on Accuracy', 'বাংলা ভাষায় কৃত্রিম বুদ্ধিমত্তার অনুবাদে যুগান্তকারী অগ্রগতি', 'New open-source AI translation models trained on Bangla corpora are outperforming commercial engines in accuracy tests, offering free tools for millions of Bengali speakers worldwide.', 'ঢাকা, Bangla AI Translation Models Now Beat Google on Accuracy। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["ai","translation","bangla"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T20:37:00+06:00'::timestamptz, '2026-08-02T20:37:00+06:00'::timestamptz, 120000, 5600, 75, 5, true, true, true, false, false, false, null, 'ঢাকা', 'বাংলা ভাষায় কৃত্রিম বুদ্ধিমত্তার অনুবাদে যুগান্তকারী অগ্রগতি | BD24News', 'New open-source AI translation models trained on Bangla corpora are outperforming commercial engines in accuracy tests, offering free tools for millions of Bengali speakers worldwide.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('national-hackathon', '500 Students Gather for National AI Hackathon in Dhaka', 'ঢাকায় জাতীয় এআই হ্যাকাথনে ৫০০ তরুণ প্রোগ্রামার', 'Young developers from across the country are competing in a 48-hour hackathon to build AI solutions for agriculture, healthcare and disaster management in Bangladesh.', 'ঢাকা, 500 Students Gather for National AI Hackathon in Dhaka। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["hackathon","startup","ai"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T11:44:00+06:00'::timestamptz, '2026-08-01T11:44:00+06:00'::timestamptz, 34000, 1400, 112, 4, false, false, false, true, false, false, null, 'ঢাকা', 'ঢাকায় জাতীয় এআই হ্যাকাথনে ৫০০ তরুণ প্রোগ্রামার | BD24News', 'Young developers from across the country are competing in a 48-hour hackathon to build AI solutions for agriculture, healthcare and disaster management in Bangladesh.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cyclone-warning', 'Cyclone ''Kabir'' Set to Hit Coastal Districts Friday Night', 'ঘূর্ণিঝড় ''কবির'' শুক্রবার রাতে উপকূলে আঘাত হানতে পারে', 'The Meteorological Department has issued a great danger signal for coastal districts as Cyclone Kabir intensifies in the Bay of Bengal. Thousands have been moved to cyclone shelters.', 'ঢাকা, Cyclone ''Kabir'' Set to Hit Coastal Districts Friday Night। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["cyclone","weather","disaster"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T14:09:00+06:00'::timestamptz, '2026-08-03T14:09:00+06:00'::timestamptz, 178000, 5100, 59, 4, true, true, false, false, false, false, null, 'ঢাকা', 'ঘূর্ণিঝড় ''কবির'' শুক্রবার রাতে উপকূলে আঘাত হানতে পারে | BD24News', 'The Meteorological Department has issued a great danger signal for coastal districts as Cyclone Kabir intensifies in the Bay of Bengal. Thousands have been moved to cyclone shelters.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cricket-bpl-final', 'BPL Final: Fortune Barishal Clinch Title in Thrilling Finish', 'বিপিএল ফাইনালে রোমাঞ্চকর জয়ে চ্যাম্পিয়ন ফরচুন বরিশাল', 'Fortune Barishal lifted the BPL trophy after a last-ball thriller against Comilla Victorians. The captain''s unbeaten 88 earned a standing ovation from a packed Mirpur stadium.', 'ঢাকা, BPL Final: Fortune Barishal Clinch Title in Thrilling Finish। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'sports', '#22C55E', '["bpl","cricket","final"]'::jsonb, 'Arif Chowdhury', 'আরিফ চৌধুরী', 'arif-chowdhury', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', 'Sports Editor', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T09:05:00+06:00'::timestamptz, '2026-08-03T09:05:00+06:00'::timestamptz, 156000, 4900, 101, 5, true, false, true, false, false, false, null, 'ঢাকা', 'বিপিএল ফাইনালে রোমাঞ্চকর জয়ে চ্যাম্পিয়ন ফরচুন বরিশাল | BD24News', 'Fortune Barishal lifted the BPL trophy after a last-ball thriller against Comilla Victorians. The captain''s unbeaten 88 earned a standing ovation from a packed Mirpur stadium.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('budget-education', 'New National Budget Boosts Education Spending by 18%', 'নতুন বাজেটে শিক্ষা খাতে ব্যয় বাড়ল ১৮ শতাংশ', 'The proposed national budget allocates significantly more funding to education, including scholarships, free textbooks and a major push to digitise primary schools.', 'ঢাকা, New National Budget Boosts Education Spending by 18%। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'education', '#F97316', '["budget","education","policy"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T17:54:00+06:00'::timestamptz, '2026-08-01T17:54:00+06:00'::timestamptz, 42000, 1600, 92, 4, false, false, false, true, false, true, null, 'ঢাকা', 'নতুন বাজেটে শিক্ষা খাতে ব্যয় বাড়ল ১৮ শতাংশ | BD24News', 'The proposed national budget allocates significantly more funding to education, including scholarships, free textbooks and a major push to digitise primary schools.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('dengue-prevention', 'Dengue Cases Rise Sharply, Hospitals on Alert Across Dhaka', 'ডেঙ্গু রোগী বাড়ছে, ঢাকায় হাসপাতালগুলোতে উচ্চ সতর্কতা', 'Hospitals across Dhaka report a sharp rise in dengue admissions as the rainy season peaks. Health officials urge residents to destroy mosquito breeding grounds.', 'ঢাকা, Dengue Cases Rise Sharply, Hospitals on Alert Across Dhaka। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'health', '#EF4444', '["dengue","health","hospital"]'::jsonb, 'Fahim Kabir', 'ফাহিম কবির', 'fahim-kabir', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80&auto=format&fit=crop', 'Health Columnist', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T14:51:00+06:00'::timestamptz, '2026-08-05T14:51:00+06:00'::timestamptz, 66000, 2400, 15, 4, false, true, false, false, false, false, null, 'ঢাকা', 'ডেঙ্গু রোগী বাড়ছে, ঢাকায় হাসপাতালগুলোতে উচ্চ সতর্কতা | BD24News', 'Hospitals across Dhaka report a sharp rise in dengue admissions as the rainy season peaks. Health officials urge residents to destroy mosquito breeding grounds.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cinema-new-film', 'Award-Winning Film ''Nodir Chhaya'' Hits Theatres This Week', 'পুরস্কারজয়ী চলচ্চিত্র ''নদীর ছায়া'' এ সপ্তাহে প্রেক্ষাগৃহে', 'The critically acclaimed film Nodir Chhaya finally gets a wide release this week. Shot across the chars of northern Bangladesh, it has already won three international awards.', 'ঢাকা, Award-Winning Film ''Nodir Chhaya'' Hits Theatres This Week। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'entertainment', '#F59E0B', '["film","cinema","bengali"]'::jsonb, 'Mim Akter', 'মিম আক্তার', 'mim-akter', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop', 'Entertainment Reporter', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T09:59:00+06:00'::timestamptz, '2026-08-04T09:59:00+06:00'::timestamptz, 78000, 3500, 100, 5, true, false, true, false, false, false, null, 'ঢাকা', 'পুরস্কারজয়ী চলচ্চিত্র ''নদীর ছায়া'' এ সপ্তাহে প্রেক্ষাগৃহে | BD24News', 'The critically acclaimed film Nodir Chhaya finally gets a wide release this week. Shot across the chars of northern Bangladesh, it has already won three international awards.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('remote-work-trend', 'Remote Work Revolution: How Dhaka''s Young Professionals Adapt', 'রিমোট ওয়ার্ক বিপ্লব: ঢাকার তরুণ পেশাজীবীদের নতুন জীবনযাপন', 'From rooftop cafés to co-working hubs, Dhaka''s workforce is embracing hybrid work. We explore the lifestyle shifts, challenges and opportunities of the new normal.', 'ঢাকা, Remote Work Revolution: How Dhaka''s Young Professionals Adapt। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'lifestyle', '#EC4899', '["remote-work","lifestyle","career"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T15:53:00+06:00'::timestamptz, '2026-08-01T15:53:00+06:00'::timestamptz, 28000, 980, 96, 5, false, false, false, false, false, false, null, 'ঢাকা', 'রিমোট ওয়ার্ক বিপ্লব: ঢাকার তরুণ পেশাজীবীদের নতুন জীবনযাপন | BD24News', 'From rooftop cafés to co-working hubs, Dhaka''s workforce is embracing hybrid work. We explore the lifestyle shifts, challenges and opportunities of the new normal.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cox-bazar-tourism', 'Cox''s Bazar Prepares for Tourist Boom as Season Begins', 'পর্যটন মৌসুম শুরুর আগেই প্রস্তুত কক্সবাজার', 'With the tourist season officially beginning, Cox''s Bazar is rolling out upgraded facilities, cleanliness drives and new safety measures along the world''s longest natural beach.', 'ঢাকা, Cox''s Bazar Prepares for Tourist Boom as Season Begins। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'travel', '#0EA5E9', '["tourism","cox-bazar","travel"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T12:45:00+06:00'::timestamptz, '2026-08-05T12:45:00+06:00'::timestamptz, 51000, 2100, 21, 4, false, false, false, false, false, false, null, 'ঢাকা', 'পর্যটন মৌসুম শুরুর আগেই প্রস্তুত কক্সবাজার | BD24News', 'With the tourist season officially beginning, Cox''s Bazar is rolling out upgraded facilities, cleanliness drives and new safety measures along the world''s longest natural beach.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('remittance-record', 'Remittance Inflow Crosses $2 Billion for the First Time', 'রেমিট্যান্স প্রথমবারের মতো ২ বিলিয়ন ডলার ছাড়াল', 'Bangladesh received record remittance inflows last month, crossing $2 billion for the first time. Experts credit formal banking channels and digital transfers for the surge.', 'ঢাকা, Remittance Inflow Crosses $2 Billion for the First Time। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["remittance","economy","banking"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T13:49:00+06:00'::timestamptz, '2026-08-01T13:49:00+06:00'::timestamptz, 39000, 1500, 78, 5, false, false, true, false, false, false, null, 'ঢাকা', 'রেমিট্যান্স প্রথমবারের মতো ২ বিলিয়ন ডলার ছাড়াল | BD24News', 'Bangladesh received record remittance inflows last month, crossing $2 billion for the first time. Experts credit formal banking channels and digital transfers for the surge.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('mosque-renovation', 'Historic Star Mosque Undergoes Restoration to Preserve Heritage', 'ঐতিহাসিক তারা মসজিদের সংস্কার শুরু, সংরক্ষিত হবে ঐতিহ্য', 'The iconic Star Mosque in Old Dhaka is undergoing careful restoration. Conservationists are working to preserve its unique mosaic work built in the early 19th century.', 'ঢাকা, Historic Star Mosque Undergoes Restoration to Preserve Heritage। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'religion', '#16A34A', '["heritage","mosque","dhaka"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T13:55:00+06:00'::timestamptz, '2026-08-01T13:55:00+06:00'::timestamptz, 25000, 1100, 29, 4, false, false, false, false, false, false, null, 'ঢাকা', 'ঐতিহাসিক তারা মসজিদের সংস্কার শুরু, সংরক্ষিত হবে ঐতিহ্য | BD24News', 'The iconic Star Mosque in Old Dhaka is undergoing careful restoration. Conservationists are working to preserve its unique mosaic work built in the early 19th century.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cyber-crime-bust', 'RAB Arrests Six in Nationwide Cyber Fraud Network Bust', 'সাইবার প্রতারণা চক্রের ৬ সদস্য গ্রেপ্তার', 'Rapid Action Battalion has dismantled a nationwide cyber fraud network, arresting six suspects accused of defrauding victims out of crores through fake investment schemes.', 'ঢাকা, RAB Arrests Six in Nationwide Cyber Fraud Network Bust। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'crime', '#18181B', '["cyber-crime","police","fraud"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T14:29:00+06:00'::timestamptz, '2026-08-04T14:29:00+06:00'::timestamptz, 88000, 3200, 97, 5, false, true, false, false, false, false, null, 'ঢাকা', 'সাইবার প্রতারণা চক্রের ৬ সদস্য গ্রেপ্তার | BD24News', 'Rapid Action Battalion has dismantled a nationwide cyber fraud network, arresting six suspects accused of defrauding victims out of crores through fake investment schemes.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('jak-export', 'RMG Exports Rise 11% as Global Demand Recovers', 'পোশাক রপ্তানি ১১ শতাংশ বেড়েছে, ঘুরে দাঁড়াচ্ছে শিল্প', 'Bangladesh''s readymade garment exports rose 11% in the last quarter, signalling a strong recovery. New orders from EU and US buyers are driving the growth.', 'ঢাকা, RMG Exports Rise 11% as Global Demand Recovers। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["rmg","export","economy"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1521566652839-697aa473761a?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T17:22:00+06:00'::timestamptz, '2026-08-02T17:22:00+06:00'::timestamptz, 61000, 1900, 57, 5, true, false, true, false, false, false, null, 'ঢাকা', 'পোশাক রপ্তানি ১১ শতাংশ বেড়েছে, ঘুরে দাঁড়াচ্ছে শিল্প | BD24News', 'Bangladesh''s readymade garment exports rose 11% in the last quarter, signalling a strong recovery. New orders from EU and US buyers are driving the growth.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('education-digital', 'Digital Classrooms Reach 10,000 Rural Schools Nationwide', 'দেশের ১০ হাজার গ্রামীণ স্কুলে ডিজিটাল ক্লাসরুম', 'The government''s flagship digital education programme has now reached 10,000 rural schools, giving millions of students access to interactive smart content for the first time.', 'ঢাকা, Digital Classrooms Reach 10,000 Rural Schools Nationwide। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'education', '#F97316', '["education","digital","school"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T08:38:00+06:00'::timestamptz, '2026-08-03T08:38:00+06:00'::timestamptz, 31000, 1200, 47, 4, false, false, false, false, false, false, null, 'ঢাকা', 'দেশের ১০ হাজার গ্রামীণ স্কুলে ডিজিটাল ক্লাসরুম | BD24News', 'The government''s flagship digital education programme has now reached 10,000 rural schools, giving millions of students access to interactive smart content for the first time.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('cl-final', 'Champions League Final Preview: Two European Giants Collide', 'চ্যাম্পিয়ন্স লিগ ফাইনাল: দুই ইউরোপীয় জায়ান্টের মহারণ আজ', 'Tonight''s Champions League final pits two European giants in a battle for continental glory. Our tactical breakdown predicts a cagey but explosive contest.', 'ঢাকা, Champions League Final Preview: Two European Giants Collide। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'sports', '#22C55E', '["champions-league","football","europe"]'::jsonb, 'Arif Chowdhury', 'আরিফ চৌধুরী', 'arif-chowdhury', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', 'Sports Editor', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T13:10:00+06:00'::timestamptz, '2026-08-05T13:10:00+06:00'::timestamptz, 143000, 5800, 122, 6, true, false, true, true, false, false, null, 'ঢাকা', 'চ্যাম্পিয়ন্স লিগ ফাইনাল: দুই ইউরোপীয় জায়ান্টের মহারণ আজ | BD24News', 'Tonight''s Champions League final pits two European giants in a battle for continental glory. Our tactical breakdown predicts a cagey but explosive contest.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('bd-tourism-festival', 'Bangladesh Tourism Festival Returns with Record Attendance', 'ফের ফিরে এল পর্যটন উৎসব, রেকর্ড দর্শনার্থী সমাগম', 'The three-day Bangladesh Tourism Festival drew record crowds at Suhrawardy Udyan, showcasing the country''s heritage, cuisine and natural beauty through 200 pavilions.', 'ঢাকা, Bangladesh Tourism Festival Returns with Record Attendance। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'travel', '#0EA5E9', '["tourism","festival","culture"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T14:59:00+06:00'::timestamptz, '2026-08-04T14:59:00+06:00'::timestamptz, 22000, 900, 60, 4, false, false, false, false, false, true, null, 'ঢাকা', 'ফের ফিরে এল পর্যটন উৎসব, রেকর্ড দর্শনার্থী সমাগম | BD24News', 'The three-day Bangladesh Tourism Festival drew record crowds at Suhrawardy Udyan, showcasing the country''s heritage, cuisine and natural beauty through 200 pavilions.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('monsoon-memories', 'Opinion: The Monsoon Economy of Rural Bengal', 'মতামত: গ্রামবাংলার বর্ষা অর্থনীতি', 'The monsoon is not just a weather event in Bangladesh — it is an economic system. From seed prices to boat-making, the rains choreograph rural livelihoods.', 'ঢাকা, Opinion: The Monsoon Economy of Rural Bengal। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'opinion', '#64748B', '["opinion","monsoon","economy"]'::jsonb, 'Tanvir Rahman', 'তানভীর রহমান', 'tanvir-rahman', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop', 'Chief Editor', 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T07:14:00+06:00'::timestamptz, '2026-08-03T07:14:00+06:00'::timestamptz, 46000, 2300, 12, 6, false, false, false, true, false, false, null, 'ঢাকা', 'মতামত: গ্রামবাংলার বর্ষা অর্থনীতি | BD24News', 'The monsoon is not just a weather event in Bangladesh — it is an economic system. From seed prices to boat-making, the rains choreograph rural livelihoods.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('sundarbans-crab', 'Inside the Crab Economy of the Sundarbans', 'সুন্দরবনের কাঁকড়া অর্থনীতির ভেতরে', 'On the banks of the Sundarbans, mud crab farming has become a lifeline for thousands of coastal families. We document a day in the life of these resilient entrepreneurs.', 'ঢাকা, Inside the Crab Economy of the Sundarbans। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'lifestyle', '#EC4899', '["sundarbans","livelihood","coastal"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1508519946611-5953f6f326ff?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1508519946611-5953f6f326ff?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T18:17:00+06:00'::timestamptz, '2026-08-03T18:17:00+06:00'::timestamptz, 18000, 760, 20, 5, false, false, false, false, false, false, null, 'ঢাকা', 'সুন্দরবনের কাঁকড়া অর্থনীতির ভেতরে | BD24News', 'On the banks of the Sundarbans, mud crab farming has become a lifeline for thousands of coastal families. We document a day in the life of these resilient entrepreneurs.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('smart-tv-local', 'Bangladeshi Startups Race to Dominate Smart TV Market', 'স্মার্ট টিভি বাজারে আধিপত্য বিস্তারে দেশীয় স্টার্টআপদের প্রতিযোগিতা', 'A new wave of local brands is challenging imported giants in the smart TV segment, offering competitive features with Bangla voice assistants and local content apps.', 'ঢাকা, Bangladeshi Startups Race to Dominate Smart TV Market। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["smart-tv","startup","consumer-tech"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T16:13:00+06:00'::timestamptz, '2026-08-02T16:13:00+06:00'::timestamptz, 26000, 1100, 131, 4, false, false, false, false, false, false, null, 'ঢাকা', 'স্মার্ট টিভি বাজারে আধিপত্য বিস্তারে দেশীয় স্টার্টআপদের প্রতিযোগিতা | BD24News', 'A new wave of local brands is challenging imported giants in the smart TV segment, offering competitive features with Bangla voice assistants and local content apps.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('rail-new-route', 'Bangladesh Railway Unveils Bullet Train Feasibility Study', 'বুলেট ট্রেনের সম্ভাব্যতা যাচাই শুরু করল রেলপথ মন্ত্রণালয়', 'Bangladesh Railway has commissioned a feasibility study for a high-speed rail corridor between Dhaka and Chattogram, a project that could cut travel time to under 90 minutes.', 'ঢাকা, Bangladesh Railway Unveils Bullet Train Feasibility Study। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["railway","infrastructure","transport"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T20:09:00+06:00'::timestamptz, '2026-08-04T20:09:00+06:00'::timestamptz, 33000, 1300, 71, 5, false, false, false, false, false, false, null, 'ঢাকা', 'বুলেট ট্রেনের সম্ভাব্যতা যাচাই শুরু করল রেলপথ মন্ত্রণালয় | BD24News', 'Bangladesh Railway has commissioned a feasibility study for a high-speed rail corridor between Dhaka and Chattogram, a project that could cut travel time to under 90 minutes.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('women-coders', 'Women in Tech: Breaking Barriers in Bangladesh''s IT Sector', 'প্রযুক্তিতে নারী: আইটি খাতে বাধা ভাঙার গল্প', 'From rural bootcamps to boardrooms, Bangladeshi women are reshaping the tech landscape. Meet five engineers who are changing the face of the country''s IT industry.', 'ঢাকা, Women in Tech: Breaking Barriers in Bangladesh''s IT Sector। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["women-in-tech","it","career"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T13:47:00+06:00'::timestamptz, '2026-08-02T13:47:00+06:00'::timestamptz, 54000, 2800, 71, 6, false, false, true, false, false, false, null, 'ঢাকা', 'প্রযুক্তিতে নারী: আইটি খাতে বাধা ভাঙার গল্প | BD24News', 'From rural bootcamps to boardrooms, Bangladeshi women are reshaping the tech landscape. Meet five engineers who are changing the face of the country''s IT industry.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('hilsa-season', 'Hilsa Season Arrives: The Tastiest Months for Bengali Fish Lovers', 'ইলিশের মৌসুম শুরু: মাছপ্রেমীদের জন্য সবচেয়ে আনন্দের মাস', 'As the monsoon rivers swell, the king of fish makes its annual journey upstream. Markets across the country are brimming with the prized hilsa.', 'ঢাকা, Hilsa Season Arrives: The Tastiest Months for Bengali Fish Lovers। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["hilsa","food","monsoon"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T19:57:00+06:00'::timestamptz, '2026-08-05T19:57:00+06:00'::timestamptz, 41000, 1700, 106, 4, false, false, false, false, false, false, null, 'ঢাকা', 'ইলিশের মৌসুম শুরু: মাছপ্রেমীদের জন্য সবচেয়ে আনন্দের মাস | BD24News', 'As the monsoon rivers swell, the king of fish makes its annual journey upstream. Markets across the country are brimming with the prized hilsa.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('un-cop-climate', 'COP Climate Talks: Bangladesh Demands Fair Climate Finance', 'জলবায়ু সম্মেলনে ন্যায্য তহবিল দাবি বাংলাদেশের', 'Bangladesh has again urged developed nations to deliver on their $100 billion climate finance pledge, warning that vulnerable deltas cannot wait for another summit cycle.', 'ঢাকা, COP Climate Talks: Bangladesh Demands Fair Climate Finance। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'international', '#2563EB', '["climate","cop","diplomacy"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T13:08:00+06:00'::timestamptz, '2026-08-03T13:08:00+06:00'::timestamptz, 58000, 2600, 134, 5, true, false, true, false, false, false, null, 'ঢাকা', 'জলবায়ু সম্মেলনে ন্যায্য তহবিল দাবি বাংলাদেশের | BD24News', 'Bangladesh has again urged developed nations to deliver on their $100 billion climate finance pledge, warning that vulnerable deltas cannot wait for another summit cycle.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('dhaka-art-biennale', 'Dhaka Art Summit Returns: Contemporary South Asian Art in Focus', 'ঢাকা আর্ট সামিট ফিরে এল, দক্ষিণ এশীয় সমসাময়িক শিল্পের প্রদর্শনী', 'The Dhaka Art Summit returns with works by over 200 artists from across South Asia, blending traditional forms with bold contemporary experiments.', 'ঢাকা, Dhaka Art Summit Returns: Contemporary South Asian Art in Focus। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'entertainment', '#F59E0B', '["art","culture","exhibition"]'::jsonb, 'Mim Akter', 'মিম আক্তার', 'mim-akter', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop', 'Entertainment Reporter', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T08:48:00+06:00'::timestamptz, '2026-08-04T08:48:00+06:00'::timestamptz, 19000, 880, 16, 4, false, false, false, false, false, false, null, 'ঢাকা', 'ঢাকা আর্ট সামিট ফিরে এল, দক্ষিণ এশীয় সমসাময়িক শিল্পের প্রদর্শনী | BD24News', 'The Dhaka Art Summit returns with works by over 200 artists from across South Asia, blending traditional forms with bold contemporary experiments.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('padma-bridge-2', 'Padma Bridge Spurs Economic Boom in the Southwest', 'পদ্মা সেতুতে দক্ষিণ-পশ্চিমাঞ্চলে অর্থনৈতিক সমৃদ্ধি', 'Two years after its opening, the Padma Bridge has catalysed a manufacturing and logistics boom across the southwest, creating tens of thousands of jobs.', 'ঢাকা, Padma Bridge Spurs Economic Boom in the Southwest। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["padma-bridge","economy","infrastructure"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T10:40:00+06:00'::timestamptz, '2026-08-01T10:40:00+06:00'::timestamptz, 92000, 3400, 44, 6, false, false, true, false, false, false, null, 'ঢাকা', 'পদ্মা সেতুতে দক্ষিণ-পশ্চিমাঞ্চলে অর্থনৈতিক সমৃদ্ধি | BD24News', 'Two years after its opening, the Padma Bridge has catalysed a manufacturing and logistics boom across the southwest, creating tens of thousands of jobs.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('amphan-relief', 'Post-Cyclone Recovery Accelerates in Coastal Districts', 'ঘূর্ণিঝড়-পরবর্তী পুনর্বাসন দ্রুত এগিয়ে চলেছে উপকূলে', 'Reconstruction efforts are picking up pace in cyclone-hit coastal areas, with thousands of homes being rebuilt and livelihood support reaching affected families.', 'ঢাকা, Post-Cyclone Recovery Accelerates in Coastal Districts। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["cyclone","relief","reconstruction"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T08:24:00+06:00'::timestamptz, '2026-08-04T08:24:00+06:00'::timestamptz, 24000, 950, 101, 4, false, false, false, false, false, false, null, 'ঢাকা', 'ঘূর্ণিঝড়-পরবর্তী পুনর্বাসন দ্রুত এগিয়ে চলেছে উপকূলে | BD24News', 'Reconstruction efforts are picking up pace in cyclone-hit coastal areas, with thousands of homes being rebuilt and livelihood support reaching affected families.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('football-youth', 'Bangladesh U-17 Footballers Shine at Asian Championship', 'এশিয়ান চ্যাম্পিয়নশিপে উজ্জ্বল বাংলাদেশের অনুর্ধ্ব-১৭ ফুটবলাররা', 'Bangladesh''s under-17 football team impressed at the Asian Championship, reaching the knockout stage for the first time in the country''s history.', 'ঢাকা, Bangladesh U-17 Footballers Shine at Asian Championship। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'sports', '#22C55E', '["football","youth","asia"]'::jsonb, 'Arif Chowdhury', 'আরিফ চৌধুরী', 'arif-chowdhury', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', 'Sports Editor', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T20:33:00+06:00'::timestamptz, '2026-08-05T20:33:00+06:00'::timestamptz, 36000, 1500, 68, 4, false, false, false, false, false, true, null, 'ঢাকা', 'এশিয়ান চ্যাম্পিয়নশিপে উজ্জ্বল বাংলাদেশের অনুর্ধ্ব-১৭ ফুটবলাররা | BD24News', 'Bangladesh''s under-17 football team impressed at the Asian Championship, reaching the knockout stage for the first time in the country''s history.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('vaccine-drive', 'New Vaccine Drive Targets 30 Million People in 90 Days', '৯০ দিনে ৩০ মিলিয়ন মানুষকে টিকা দেওয়ার লক্ষ্যমাত্রা', 'Health authorities have launched an ambitious vaccination drive aimed at reaching 30 million people in 90 days, focusing on rural areas with limited access to care.', 'ঢাকা, New Vaccine Drive Targets 30 Million People in 90 Days। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'health', '#EF4444', '["vaccine","health","campaign"]'::jsonb, 'Fahim Kabir', 'ফাহিম কবির', 'fahim-kabir', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80&auto=format&fit=crop', 'Health Columnist', 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T06:43:00+06:00'::timestamptz, '2026-08-05T06:43:00+06:00'::timestamptz, 29000, 1200, 33, 4, false, false, false, false, false, false, null, 'ঢাকা', '৯০ দিনে ৩০ মিলিয়ন মানুষকে টিকা দেওয়ার লক্ষ্যমাত্রা | BD24News', 'Health authorities have launched an ambitious vaccination drive aimed at reaching 30 million people in 90 days, focusing on rural areas with limited access to care.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('bd-chess-grandmaster', 'Teen Chess Prodigy Becomes Bangladesh''s Third Grandmaster', 'কিশোর দাবাড়ু হয়ে গেলেন বাংলাদেশের তৃতীয় গ্র্যান্ডমাস্টার', 'At just 15, the country''s newest grandmaster sealed the title with a stunning win at an international tournament, inspiring a new generation of young chess players.', 'ঢাকা, Teen Chess Prodigy Becomes Bangladesh''s Third Grandmaster। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'sports', '#22C55E', '["chess","grandmaster","achievement"]'::jsonb, 'Arif Chowdhury', 'আরিফ চৌধুরী', 'arif-chowdhury', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', 'Sports Editor', 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T14:49:00+06:00'::timestamptz, '2026-08-05T14:49:00+06:00'::timestamptz, 82000, 3900, 91, 5, true, false, false, false, false, false, null, 'ঢাকা', 'কিশোর দাবাড়ু হয়ে গেলেন বাংলাদেশের তৃতীয় গ্র্যান্ডমাস্টার | BD24News', 'At just 15, the country''s newest grandmaster sealed the title with a stunning win at an international tournament, inspiring a new generation of young chess players.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('rural-internet', '4G Coverage Reaches 98% of Bangladesh''s Population', 'দেশের ৯৮ শতাংশ জনগোষ্ঠীর কাছে পৌঁছেছে ফোরজি নেটওয়ার্ক', 'Telecom operators have extended 4G coverage to 98% of the population, connecting remote villages and opening doors to digital services in education and healthcare.', 'ঢাকা, 4G Coverage Reaches 98% of Bangladesh''s Population। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["4g","internet","telecom"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T15:27:00+06:00'::timestamptz, '2026-08-01T15:27:00+06:00'::timestamptz, 27000, 1000, 44, 4, false, false, false, false, false, false, null, 'ঢাকা', 'দেশের ৯৮ শতাংশ জনগোষ্ঠীর কাছে পৌঁছেছে ফোরজি নেটওয়ার্ক | BD24News', 'Telecom operators have extended 4G coverage to 98% of the population, connecting remote villages and opening doors to digital services in education and healthcare.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('street-food-guide', 'Old Dhaka Street Food: A Culinary Pilgrimage', 'পুরান ঢাকার স্ট্রিট ফুড: এক রন্ধনসম্পর্কীয় তীর্থযাত্রা', 'From nihari at 4am to tangy fuchka at dusk, we take you on a mouth-watering tour of Old Dhaka''s legendary street food scene.', 'ঢাকা, Old Dhaka Street Food: A Culinary Pilgrimage। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'travel', '#0EA5E9', '["food","old-dhaka","street-food"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T06:46:00+06:00'::timestamptz, '2026-08-04T06:46:00+06:00'::timestamptz, 47000, 2000, 71, 6, false, false, false, false, false, false, null, 'ঢাকা', 'পুরান ঢাকার স্ট্রিট ফুড: এক রন্ধনসম্পর্কীয় তীর্থযাত্রা | BD24News', 'From nihari at 4am to tangy fuchka at dusk, we take you on a mouth-watering tour of Old Dhaka''s legendary street food scene.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('border-trade', 'Border Trade Hubs Open New Export Avenues for SMEs', 'সীমান্ত বাণিজ্য হাবে এসএমই রপ্তানির নতুন পথ', 'New border trade hubs are helping small and medium enterprises export directly to neighbouring markets, cutting costs and opening fresh opportunities.', 'ঢাকা, Border Trade Hubs Open New Export Avenues for SMEs। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'economy', '#059669', '["trade","sme","export"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T11:32:00+06:00'::timestamptz, '2026-08-05T11:32:00+06:00'::timestamptz, 16000, 700, 31, 4, false, false, false, false, false, false, null, 'ঢাকা', 'সীমান্ত বাণিজ্য হাবে এসএমই রপ্তানির নতুন পথ | BD24News', 'New border trade hubs are helping small and medium enterprises export directly to neighbouring markets, cutting costs and opening fresh opportunities.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('eid-traffic', 'Eid Journey Begins: Authorities Roll Out Special Trains and Buses', 'ঈদযাত্রা শুরু: বিশেষ ট্রেন ও বাস চালু করল কর্তৃপক্ষ', 'Millions begin the annual Eid journey home as authorities launch special trains, buses and launch services. Ferries on major routes have been doubled.', 'ঢাকা, Eid Journey Begins: Authorities Roll Out Special Trains and Buses। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["eid","transport","festival"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T22:38:00+06:00'::timestamptz, '2026-08-03T22:38:00+06:00'::timestamptz, 68000, 2700, 54, 4, false, false, true, false, false, false, null, 'ঢাকা', 'ঈদযাত্রা শুরু: বিশেষ ট্রেন ও বাস চালু করল কর্তৃপক্ষ | BD24News', 'Millions begin the annual Eid journey home as authorities launch special trains, buses and launch services. Ferries on major routes have been doubled.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('bengal-tiger-census', 'Sundarbans Tiger Population Grows for First Time in a Decade', 'এক দশকে প্রথমবার বাড়ল সুন্দরবনে বাঘের সংখ্যা', 'A new camera-trap census reveals the Sundarbans tiger population has grown for the first time in a decade, a cautious win for conservation efforts.', 'ঢাকা, Sundarbans Tiger Population Grows for First Time in a Decade। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["tigers","wildlife","sundarbans"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T17:48:00+06:00'::timestamptz, '2026-08-02T17:48:00+06:00'::timestamptz, 73000, 3200, 45, 5, false, false, false, false, false, false, null, 'ঢাকা', 'এক দশকে প্রথমবার বাড়ল সুন্দরবনে বাঘের সংখ্যা | BD24News', 'A new camera-trap census reveals the Sundarbans tiger population has grown for the first time in a decade, a cautious win for conservation efforts.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('tortured-women', 'Opinion: The Courage of Women in Garment Factories', 'মতামত: তৈরি পোশাক কারখানার নারীদের সাহস', 'Behind every export milestone stand millions of women whose quiet courage powers the nation''s economy. Their story deserves more than statistics.', 'ঢাকা, Opinion: The Courage of Women in Garment Factories। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'opinion', '#64748B', '["opinion","women","rmg"]'::jsonb, 'Tanvir Rahman', 'তানভীর রহমান', 'tanvir-rahman', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop', 'Chief Editor', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T22:58:00+06:00'::timestamptz, '2026-08-05T22:58:00+06:00'::timestamptz, 51000, 2600, 4, 5, false, false, false, true, false, false, null, 'ঢাকা', 'মতামত: তৈরি পোশাক কারখানার নারীদের সাহস | BD24News', 'Behind every export milestone stand millions of women whose quiet courage powers the nation''s economy. Their story deserves more than statistics.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('rte-act', 'New Education Act to Guarantee Free Secondary Schooling', 'নতুন শিক্ষা আইনে মাধ্যমিক পর্যায়ে বিনামূল্যে শিক্ষা নিশ্চিত', 'Parliament is set to pass a landmark education act guaranteeing free and compulsory secondary education, alongside a charter of rights for teachers.', 'ঢাকা, New Education Act to Guarantee Free Secondary Schooling। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'education', '#F97316', '["education","law","policy"]'::jsonb, 'Nusrat Jahan', 'নুসরাত জাহান', 'nusrat-jahan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', 'Senior Reporter', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T16:31:00+06:00'::timestamptz, '2026-08-05T16:31:00+06:00'::timestamptz, 21000, 860, 8, 4, false, false, false, false, false, false, null, 'ঢাকা', 'নতুন শিক্ষা আইনে মাধ্যমিক পর্যায়ে বিনামূল্যে শিক্ষা নিশ্চিত | BD24News', 'Parliament is set to pass a landmark education act guaranteeing free and compulsory secondary education, alongside a charter of rights for teachers.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('film-festival-short', 'Bangladeshi Short Film Selected for Cannes Official Selection', 'কান চলচ্চিত্র উৎসবের অফিসিয়াল নির্বাচনে বাংলাদেশের স্বল্পদৈর্ঘ্য চলচ্চিত্র', 'A 15-minute short film from Dhaka has been selected for the official competition at Cannes, the first Bangladeshi film in a decade to earn the honour.', 'ঢাকা, Bangladeshi Short Film Selected for Cannes Official Selection। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'entertainment', '#F59E0B', '["cannes","film","achievement"]'::jsonb, 'Mim Akter', 'মিম আক্তার', 'mim-akter', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop', 'Entertainment Reporter', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T17:56:00+06:00'::timestamptz, '2026-08-01T17:56:00+06:00'::timestamptz, 96000, 4700, 82, 5, true, false, true, false, false, false, null, 'ঢাকা', 'কান চলচ্চিত্র উৎসবের অফিসিয়াল নির্বাচনে বাংলাদেশের স্বল্পদৈর্ঘ্য চলচ্চিত্র | BD24News', 'A 15-minute short film from Dhaka has been selected for the official competition at Cannes, the first Bangladeshi film in a decade to earn the honour.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('green-energy', 'Solar Power Overtakes Coal in Bangladesh for the First Time', 'বাংলাদেশে কয়লাকে ছাড়িয়ে গেছে সৌরবিদ্যুৎ', 'In a historic first, solar power contributed more to the national grid than coal last month, underscoring the country''s renewable energy transition.', 'ঢাকা, Solar Power Overtakes Coal in Bangladesh for the First Time। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'technology', '#0891B2', '["solar","energy","renewable"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-02T07:15:00+06:00'::timestamptz, '2026-08-02T07:15:00+06:00'::timestamptz, 44000, 1800, 24, 4, false, false, false, false, false, true, null, 'ঢাকা', 'বাংলাদেশে কয়লাকে ছাড়িয়ে গেছে সৌরবিদ্যুৎ | BD24News', 'In a historic first, solar power contributed more to the national grid than coal last month, underscoring the country''s renewable energy transition.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('covid-update', 'Health Ministry Issues Updated Guidelines for Seasonal Flu', 'মৌসুমি ফ্লুর নতুন চিকিৎসা নির্দেশিকা প্রকাশ করল স্বাস্থ্য মন্ত্রণালয়', 'The health ministry has released updated guidelines for managing seasonal flu outbreaks, with a focus on protecting children and the elderly.', 'ঢাকা, Health Ministry Issues Updated Guidelines for Seasonal Flu। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'health', '#EF4444', '["flu","health","guidelines"]'::jsonb, 'Fahim Kabir', 'ফাহিম কবির', 'fahim-kabir', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80&auto=format&fit=crop', 'Health Columnist', 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-01T21:52:00+06:00'::timestamptz, '2026-08-01T21:52:00+06:00'::timestamptz, 14000, 600, 21, 3, false, false, false, false, false, false, null, 'ঢাকা', 'মৌসুমি ফ্লুর নতুন চিকিৎসা নির্দেশিকা প্রকাশ করল স্বাস্থ্য মন্ত্রণালয় | BD24News', 'The health ministry has released updated guidelines for managing seasonal flu outbreaks, with a focus on protecting children and the elderly.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('rohingya-education', 'UN Agency Praises Bangladesh for Hosting Rohingya Schools', 'রোহিঙ্গা শিশুদের শিক্ষা কার্যক্রমের প্রশংসা জাতিসংঘের', 'A UN delegation has praised Bangladesh''s efforts to provide education to Rohingya refugee children, calling the programme a regional model of compassion.', 'ঢাকা, UN Agency Praises Bangladesh for Hosting Rohingya Schools। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'international', '#2563EB', '["rohingya","refugee","education"]'::jsonb, 'Rakib Hassan', 'রাকিব হাসান', 'rakib-hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop', 'International Correspondent', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T10:08:00+06:00'::timestamptz, '2026-08-05T10:08:00+06:00'::timestamptz, 38000, 1700, 125, 5, false, false, false, false, false, false, null, 'ঢাকা', 'রোহিঙ্গা শিশুদের শিক্ষা কার্যক্রমের প্রশংসা জাতিসংঘের | BD24News', 'A UN delegation has praised Bangladesh''s efforts to provide education to Rohingya refugee children, calling the programme a regional model of compassion.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('street-art-dhaka', 'Graffiti Artists Transform Dhaka''s Walls Into Open Galleries', 'ঢাকার দেয়ালগুলোকে ক্যানভাস বানিয়ে দিচ্ছে গ্রাফিতি শিল্পীরা', 'A vibrant street-art movement is transforming Dhaka''s grey walls into open-air galleries, giving voice to young creatives across the capital.', 'ঢাকা, Graffiti Artists Transform Dhaka''s Walls Into Open Galleries। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'lifestyle', '#EC4899', '["art","street-art","dhaka"]'::jsonb, 'Mim Akter', 'মিম আক্তার', 'mim-akter', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop', 'Entertainment Reporter', 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T11:16:00+06:00'::timestamptz, '2026-08-05T11:16:00+06:00'::timestamptz, 20000, 920, 139, 4, false, false, false, false, false, false, null, 'ঢাকা', 'ঢাকার দেয়ালগুলোকে ক্যানভাস বানিয়ে দিচ্ছে গ্রাফিতি শিল্পীরা | BD24News', 'A vibrant street-art movement is transforming Dhaka''s grey walls into open-air galleries, giving voice to young creatives across the capital.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('job-market-2025', 'Job Market Report: These 10 Skills Will Dominate 2025', 'চাকরির বাজার ২০২৫: এই ১০ দক্ষতা থাকবে সবচেয়ে চাহিদাপূর্ণ', 'Our analysis of hiring data reveals the ten skills that will dominate Bangladesh''s job market in 2025, from data literacy to Bangla AI prompting.', 'ঢাকা, Job Market Report: These 10 Skills Will Dominate 2025। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'jobs', '#6366F1', '["jobs","career","skills"]'::jsonb, 'Tanvir Rahman', 'তানভীর রহমান', 'tanvir-rahman', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format&fit=crop', 'Chief Editor', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-05T19:13:00+06:00'::timestamptz, '2026-08-05T19:13:00+06:00'::timestamptz, 87000, 4200, 55, 6, false, false, false, false, false, false, null, 'ঢাকা', 'চাকরির বাজার ২০২৫: এই ১০ দক্ষতা থাকবে সবচেয়ে চাহিদাপূর্ণ | BD24News', 'Our analysis of hiring data reveals the ten skills that will dominate Bangladesh''s job market in 2025, from data literacy to Bangla AI prompting.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('govt-digital-service', 'One-Stop Digital Portal Relaunches with 500 Government Services', '৫০০ সরকারি সেবা নিয়ে নতুন রূপে চালু হল এক-স্টপ ডিজিটাল পোর্টাল', 'The national digital services portal has relaunched with 500 services, letting citizens apply for documents, pay bills and track cases without visiting offices.', 'ঢাকা, One-Stop Digital Portal Relaunches with 500 Government Services। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'bangladesh', '#E50914', '["digital-services","e-government","tech"]'::jsonb, 'Sadia Islam', 'সাদিয়া ইসলাম', 'sadia-islam', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', 'Technology Writer', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-03T18:42:00+06:00'::timestamptz, '2026-08-03T18:42:00+06:00'::timestamptz, 32000, 1300, 99, 4, false, false, false, false, false, false, null, 'ঢাকা', '৫০০ সরকারি সেবা নিয়ে নতুন রূপে চালু হল এক-স্টপ ডিজিটাল পোর্টাল | BD24News', 'The national digital services portal has relaunched with 500 services, letting citizens apply for documents, pay bills and track cases without visiting offices.', 'published')
on conflict (slug) do nothing;
insert into public.articles (slug, title, title_bn, excerpt, body, category, category_color, tags, author, author_name_bn, author_slug, author_avatar, author_role, cover_image, images, published_at, updated_at, views, likes, comments_count, reading_minutes, featured, breaking, trending, editor_pick, is_video, is_gallery, video_url, location, seo_title, seo_description, status)
values ('national-park-trek', 'Trekking Sajek: The Valley of Clouds Opens New Trails', 'সাজেক ভ্যালি: মেঘের রাজ্যে নতুন ট্রেইল চালু', 'Sajek Valley has opened two new trekking trails offering panoramic views of the hill tracts, complete with eco-lodges run by indigenous communities.', 'ঢাকা, Trekking Sajek: The Valley of Clouds Opens New Trails। বিডি২৪নিউজের বিশেষ প্রতিবেদন। এই ঘটনা/অগ্রগতি নিয়ে দেশজুড়ে ব্যাপক আলোচনা চলছে। সংশ্লিষ্ট সূত্রগুলো এ বিষয়ে নানা দৃষ্টিকোণ থেকে বিশ্লেষণ করছে এবং আগামী কয়েক দিনে পরিস্থিতি আরও স্পষ্ট হবে বলে ধারণা করছেন বিশেষজ্ঞরা।

এ ব্যাপারে বিডি২৪নিউজের পক্ষ থেকে একাধিক সূত্রের সঙ্গে কথা বলা হয়েছে। প্রাপ্ত তথ্য অনুযায়ী, এই উদ্যোগের ফলে সাধারণ মানুষের দৈনন্দিন জীবনে ইতিবাচক প্রভাব পড়বে। সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, প্রয়োজনীয় সব প্রস্তুতি ইতিমধ্যেই সম্পন্ন করা হয়েছে।

বিশেষজ্ঞরা বলছেন, এই সিদ্ধান্ত দীর্ঘমেয়াদে জাতীয় অর্থনীতিতে গুরুত্বপূর্ণ ভূমিকা রাখবে। তবে বাস্তবায়ন পর্যায়ে কিছু চ্যালেঞ্জও রয়েছে। সেগুলো মোকাবিলায় একটি রোডম্যাপ তৈরি করা হয়েছে এবং পর্যায়ক্রমে তা বাস্তবায়ন করা হবে।

এদিকে সাধারণ মানুষের প্রতিক্রিয়াও মিশ্র। কেউ কেউ এই উদ্যোগকে স্বাগত জানালেও, কেউ কেউ এর সঠিক বাস্তবায়ন নিয়ে সন্দেহ প্রকাশ করেছেন। সংশ্লিষ্ট মন্ত্রণালয় অবশ্য আশ্বস্ত করেছে, সবকিছু স্বচ্ছ প্রক্রিয়ায় সম্পন্ন হবে।

আন্তর্জাতিক পর্যায়েও এই ঘটনা নিয়ে আলোচনা শুরু হয়েছে। বিভিন্ন দেশের গণমাধ্যম এ নিয়ে প্রতিবেদন প্রকাশ করছে। বাংলাদেশের এই পদক্ষেপকে দক্ষিণ এশিয়ার অন্য দেশগুলোর জন্য অনুকরণীয় দৃষ্টান্ত হিসেবে দেখা হচ্ছে।

সবশেষ খবর পাওয়া পর্যন্ত পরিস্থিতি স্বাভাবিক রয়েছে। বিডি২৪নিউজ এই বিষয়ে যেকোনো নতুন তথ্য পাওয়া মাত্রই পাঠকদের অবগত করবে। আমাদের প্রতিনিধিরা ঘটনাস্থলে কাজ করছেন এবং সরেজমিন তথ্য সংগ্রহ করছেন।', 'travel', '#0EA5E9', '["sajek","trekking","hill-tracts"]'::jsonb, 'Isha Khan', 'ইশা খান', 'isha-khan', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop', 'Lifestyle Writer', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop', '["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop"]'::jsonb, '2026-08-04T22:28:00+06:00'::timestamptz, '2026-08-04T22:28:00+06:00'::timestamptz, 49000, 2100, 34, 5, false, false, false, false, false, false, null, 'ঢাকা', 'সাজেক ভ্যালি: মেঘের রাজ্যে নতুন ট্রেইল চালু | BD24News', 'Sajek Valley has opened two new trekking trails offering panoramic views of the hill tracts, complete with eco-lodges run by indigenous communities.', 'published')
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('metro', 'metro', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('transport', 'transport', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('dhaka', 'dhaka', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('bangladesh-bank', 'bangladesh-bank', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('economy', 'economy', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('finance', 'finance', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cricket', 'cricket', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('world-cup', 'world-cup', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('tigers', 'tigers', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('pollution', 'pollution', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('environment', 'environment', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('health', 'health', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('gold', 'gold', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('market', 'market', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('price', 'price', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('gaza', 'gaza', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('israel', 'israel', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('middle-east', 'middle-east', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('ai', 'ai', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('translation', 'translation', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('bangla', 'bangla', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('hackathon', 'hackathon', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('startup', 'startup', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cyclone', 'cyclone', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('weather', 'weather', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('disaster', 'disaster', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('bpl', 'bpl', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('final', 'final', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('budget', 'budget', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('education', 'education', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('policy', 'policy', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('dengue', 'dengue', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('hospital', 'hospital', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('film', 'film', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cinema', 'cinema', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('bengali', 'bengali', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('remote-work', 'remote-work', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('lifestyle', 'lifestyle', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('career', 'career', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('tourism', 'tourism', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cox-bazar', 'cox-bazar', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('travel', 'travel', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('remittance', 'remittance', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('banking', 'banking', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('heritage', 'heritage', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('mosque', 'mosque', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cyber-crime', 'cyber-crime', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('police', 'police', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('fraud', 'fraud', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('rmg', 'rmg', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('export', 'export', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('digital', 'digital', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('school', 'school', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('champions-league', 'champions-league', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('football', 'football', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('europe', 'europe', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('festival', 'festival', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('culture', 'culture', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('opinion', 'opinion', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('monsoon', 'monsoon', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('sundarbans', 'sundarbans', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('livelihood', 'livelihood', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('coastal', 'coastal', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('smart-tv', 'smart-tv', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('consumer-tech', 'consumer-tech', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('railway', 'railway', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('infrastructure', 'infrastructure', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('women-in-tech', 'women-in-tech', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('it', 'it', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('hilsa', 'hilsa', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('food', 'food', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('climate', 'climate', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cop', 'cop', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('diplomacy', 'diplomacy', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('art', 'art', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('exhibition', 'exhibition', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('padma-bridge', 'padma-bridge', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('relief', 'relief', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('reconstruction', 'reconstruction', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('youth', 'youth', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('asia', 'asia', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('vaccine', 'vaccine', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('campaign', 'campaign', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('chess', 'chess', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('grandmaster', 'grandmaster', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('achievement', 'achievement', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('4g', '4g', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('internet', 'internet', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('telecom', 'telecom', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('old-dhaka', 'old-dhaka', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('street-food', 'street-food', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('trade', 'trade', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('sme', 'sme', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('eid', 'eid', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('wildlife', 'wildlife', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('women', 'women', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('law', 'law', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('cannes', 'cannes', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('solar', 'solar', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('energy', 'energy', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('renewable', 'renewable', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('flu', 'flu', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('guidelines', 'guidelines', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('rohingya', 'rohingya', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('refugee', 'refugee', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('street-art', 'street-art', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('jobs', 'jobs', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('skills', 'skills', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('digital-services', 'digital-services', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('e-government', 'e-government', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('tech', 'tech', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('sajek', 'sajek', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('trekking', 'trekking', false, 0)
on conflict (slug) do nothing;
insert into public.tags (slug, name, trending, views)
values ('hill-tracts', 'hill-tracts', false, 0)
on conflict (slug) do nothing;
insert into public.settings (key, value)
values ('general', '{"siteName":"BD24News","siteTagline":"Bangladesh''s Leading News Portal","description":"Latest Bangladeshi news, sports, economy, technology and more, updated 24/7.","siteUrl":"https://bd24news.vercel.app","timezone":"asia/dhaka","locale":"bn","defaultDarkMode":true,"accentColor":"#E50914","primaryFont":"hind","enableEnglish":true,"defaultLanguage":"bn","pushNotifications":true,"breakingAlerts":true,"emailOnComment":false,"forceHttps":true,"csp":"default-src ''self''; img-src ''self'' data: https:; script-src ''self'' ''unsafe-inline'';","social":{"facebook":"https://facebook.com/bd24news","twitter":"https://x.com/bd24news","youtube":"https://youtube.com/@bd24news","instagram":"https://instagram.com/bd24news","tiktok":"https://tiktok.com/@bd24news","telegram":"https://t.me/bd24news"}}'::jsonb), ('seo', '{"defaultTitle":"BD24News — Bangladesh''s Leading News Portal","defaultDescription":"Latest Bangladeshi news, sports, economy, technology and more.","keywords":"bangladesh news, cricket, economy, technology, sports, dhaka","allowIndexing":true,"autoSitemap":true,"jsonLd":true,"categoryPages":"dynamic","tagPages":"noindex","authorPages":"index","canonicalBase":"https://bd24news.vercel.app","ogImageEnabled":true,"ogTitle":"BD24News","ogDescription":"Breaking news from Bangladesh and around the world.","twitterHandle":"@bd24news"}'::jsonb)
on conflict (key) do nothing;
insert into public.meta (key, value)
values ('init', '{"initializedAt":"2026-08-10T04:18:58.621Z","version":1}'::jsonb)
on conflict (key) do nothing;

-- ================================================================
-- End of migration
-- ================================================================
