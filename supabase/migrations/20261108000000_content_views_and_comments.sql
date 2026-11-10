-- ================================================================
-- BD24News — additive migration
--   1. Atomic, deduplicated article view counting (Asia/Dhaka day)
--   2. Admin view controls
--   3. Per-article comments toggle + moderated, rate-limited submissions
--   4. Official/automated replies and reply threading
--   5. Published-only comment visibility + accurate comments_count
-- Safe to run more than once. No existing data is deleted.
-- ================================================================

-- ----------------------------------------------------------------
-- Columns (all additive, defaults preserve current behaviour)
-- ----------------------------------------------------------------
alter table public.articles
  add column if not exists comments_enabled boolean not null default true;

alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade;

alter table public.comments
  add column if not exists is_official boolean not null default false;

alter table public.comments
  add column if not exists visitor_id text not null default '';

create index if not exists comments_parent_id_idx on public.comments(parent_id);
create index if not exists comments_status_idx on public.comments(status);

-- ----------------------------------------------------------------
-- View log: one row per article / anonymous visitor / Dhaka day.
-- RLS is enabled with no policies so only security-definer functions
-- (owned by the migration role, which bypasses RLS as table owner)
-- can read or write it.
-- ----------------------------------------------------------------
create table if not exists public.article_views (
  id bigint generated always as identity primary key,
  article_id uuid not null references public.articles(id) on delete cascade,
  visitor_id text not null,
  view_date date not null default ((now() at time zone 'Asia/Dhaka')::date),
  created_at timestamptz not null default now(),
  unique (article_id, visitor_id, view_date)
);

create index if not exists article_views_article_idx on public.article_views(article_id);
alter table public.article_views enable row level security;

-- ----------------------------------------------------------------
-- Public view counter (called by the article page).
--   * ignores administrators
--   * counts at most once per visitor per Dhaka day
--   * atomic single-statement increment
-- ----------------------------------------------------------------
create or replace function public.increment_article_views(
  p_article_id uuid,
  p_visitor_id text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint;
  v_inserted integer := 0;
  v_visitor text := left(coalesce(p_visitor_id, ''), 64);
begin
  if p_article_id is null then
    return null;
  end if;

  select views into v_views from public.articles where id = p_article_id;
  if v_views is null then
    return null;
  end if;

  -- Administrators must never inflate public counts.
  if public.is_admin() then
    return v_views;
  end if;

  if length(v_visitor) < 8 then
    return v_views;
  end if;

  insert into public.article_views (article_id, visitor_id)
  values (p_article_id, v_visitor)
  on conflict (article_id, visitor_id, view_date) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    perform set_config('bd24.preserve_updated_at', 'on', true);
    update public.articles
       set views = coalesce(views, 0) + 1
     where id = p_article_id
     returning views into v_views;
    perform set_config('bd24.preserve_updated_at', 'off', true);
  end if;

  return v_views;
end;
$$;

revoke all on function public.increment_article_views(uuid, text) from public;
grant execute on function public.increment_article_views(uuid, text) to anon, authenticated;

-- ----------------------------------------------------------------
-- Admin view controls
-- ----------------------------------------------------------------
create or replace function public.admin_set_article_views(
  p_article_id uuid,
  p_views bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;
  if p_views is null or p_views < 0 then
    raise exception 'invalid_view_count';
  end if;

  perform set_config('bd24.preserve_updated_at', 'on', true);
  update public.articles
     set views = p_views
   where id = p_article_id
   returning views into v_views;
  perform set_config('bd24.preserve_updated_at', 'off', true);

  return v_views;
end;
$$;

revoke all on function public.admin_set_article_views(uuid, bigint) from public;
grant execute on function public.admin_set_article_views(uuid, bigint) to authenticated;

create or replace function public.admin_adjust_article_views(
  p_article_id uuid,
  p_delta bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views bigint;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  perform set_config('bd24.preserve_updated_at', 'on', true);
  update public.articles
     set views = greatest(coalesce(views, 0) + coalesce(p_delta, 0), 0)
   where id = p_article_id
   returning views into v_views;
  perform set_config('bd24.preserve_updated_at', 'off', true);

  return v_views;
end;
$$;

revoke all on function public.admin_adjust_article_views(uuid, bigint) from public;
grant execute on function public.admin_adjust_article_views(uuid, bigint) to authenticated;

-- ----------------------------------------------------------------
-- Comment settings (admin-approved templates + moderation mode)
-- ----------------------------------------------------------------
insert into public.settings (key, value)
values (
  'comments',
  jsonb_build_object(
    'enabled', true,
    'moderation', 'pending',
    'autoAckEnabled', true,
    'autoAckTemplateBn', 'ধন্যবাদ {name}, আপনার মন্তব্যের জন্য। এটি বিডি২৪নিউজের স্বয়ংক্রিয় বার্তা।',
    'autoAckTemplateEn', 'Thank you {name} for your comment. This is an automated message from BD24News.',
    'rateLimitSeconds', 30,
    'maxLength', 2000
  )
)
on conflict (key) do nothing;

-- ----------------------------------------------------------------
-- Moderated comment submission.
-- Enforces: article exists/published, comments enabled, global
-- enabled, rate limit, length limits, moderation status, and
-- clearly-labelled automated acknowledgement.
-- ----------------------------------------------------------------
create or replace function public.submit_comment(
  p_article_id text,
  p_author text,
  p_content text,
  p_visitor_id text,
  p_parent_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_article record;
  v_settings jsonb := '{}'::jsonb;
  v_enabled boolean := true;
  v_moderation text := 'pending';
  v_rate_seconds integer := 30;
  v_max_length integer := 2000;
  v_author text;
  v_content text;
  v_visitor text;
  v_status text;
  v_id uuid;
  v_recent integer := 0;
begin
  select id, slug, status, comments_enabled
    into v_article
    from public.articles
   where id::text = p_article_id or slug = p_article_id
   limit 1;

  if v_article.id is null or v_article.status <> 'published' then
    raise exception 'article_not_found';
  end if;

  select value into v_settings from public.settings where key = 'comments';
  v_settings := coalesce(v_settings, '{}'::jsonb);

  v_enabled := coalesce((v_settings->>'enabled')::boolean, true);
  if not v_enabled or v_article.comments_enabled = false then
    raise exception 'comments_disabled';
  end if;

  v_moderation := coalesce(v_settings->>'moderation', 'pending');
  v_rate_seconds := greatest(coalesce((v_settings->>'rateLimitSeconds')::integer, 30), 0);
  v_max_length := least(greatest(coalesce((v_settings->>'maxLength')::integer, 2000), 40), 5000);

  v_author := left(
    regexp_replace(btrim(coalesce(p_author, '')), '[[:cntrl:]]', '', 'g'),
    60
  );
  if length(v_author) < 2 then
    raise exception 'invalid_author';
  end if;

  v_content := left(
    regexp_replace(btrim(coalesce(p_content, '')), '[[:cntrl:]]', ' ', 'g'),
    v_max_length
  );
  if length(v_content) < 2 then
    raise exception 'invalid_content';
  end if;

  v_visitor := left(coalesce(p_visitor_id, ''), 64);
  if length(v_visitor) >= 8 and v_rate_seconds > 0 then
    select count(*) into v_recent
      from public.comments
     where visitor_id = v_visitor
       and created_at > now() - make_interval(secs => v_rate_seconds);
    if v_recent > 0 then
      raise exception 'rate_limited';
    end if;
  end if;

  if p_parent_id is not null then
    if not exists (
      select 1 from public.comments
       where id = p_parent_id
         and article_id = v_article.id::text
         and status = 'published'
    ) then
      raise exception 'invalid_parent';
    end if;
  end if;

  v_status := case when v_moderation = 'published' then 'published' else 'pending' end;

  insert into public.comments (article_id, author, content, status, visitor_id, parent_id)
  values (v_article.id::text, v_author, v_content, v_status, v_visitor, p_parent_id)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'status', v_status);
end;
$$;

revoke all on function public.submit_comment(text, text, text, text, uuid) from public;
grant execute on function public.submit_comment(text, text, text, text, uuid) to anon, authenticated;

-- ----------------------------------------------------------------
-- Keep articles.comments_count accurate for published comments
-- ----------------------------------------------------------------

-- Preserve updated_at when only derived counters change. This replaces
-- the shared trigger helper but keeps identical behaviour unless the
-- transaction explicitly sets bd24.preserve_updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('bd24.preserve_updated_at', true), '') <> 'on' then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create or replace function public.sync_article_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_article_id text;
  v_delta integer := 0;
begin
  -- Official/automated replies are labelled separately and must not
  -- inflate the reader-facing comment count.
  if tg_op = 'INSERT' then
    v_article_id := new.article_id;
    if new.status = 'published' and not coalesce(new.is_official, false) then
      v_delta := 1;
    end if;
  elsif tg_op = 'DELETE' then
    v_article_id := old.article_id;
    if old.status = 'published' and not coalesce(old.is_official, false) then
      v_delta := -1;
    end if;
  else
    v_article_id := coalesce(new.article_id, old.article_id);
    if not coalesce(old.is_official, false) and not coalesce(new.is_official, false) then
      if old.status <> 'published' and new.status = 'published' then
        v_delta := 1;
      elsif old.status = 'published' and new.status <> 'published' then
        v_delta := -1;
      end if;
    end if;
  end if;

  if v_delta <> 0 and v_article_id is not null then
    perform set_config('bd24.preserve_updated_at', 'on', true);
    update public.articles
       set comments_count = greatest(coalesce(comments_count, 0) + v_delta, 0)
     where id::text = v_article_id or slug = v_article_id;
    perform set_config('bd24.preserve_updated_at', 'off', true);
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists comments_sync_count on public.comments;
create trigger comments_sync_count
after insert or update of status or delete on public.comments
for each row execute function public.sync_article_comments_count();

-- ----------------------------------------------------------------
-- Automated acknowledgement. Runs the first time a reader comment
-- becomes published (immediately, or when a moderator approves it).
-- The reply is always flagged is_official and clearly labelled.
-- ----------------------------------------------------------------
create or replace function public.send_comment_acknowledgement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings jsonb := '{}'::jsonb;
  v_general jsonb := '{}'::jsonb;
  v_auto boolean := false;
  v_lang text := 'bn';
  v_template text;
  v_content text;
begin
  if new.status <> 'published' or coalesce(new.is_official, false) then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'published' then
    return new;
  end if;

  select value into v_settings from public.settings where key = 'comments';
  v_settings := coalesce(v_settings, '{}'::jsonb);
  v_auto := coalesce((v_settings->>'autoAckEnabled')::boolean, false);
  if not v_auto then
    return new;
  end if;

  if exists (
    select 1 from public.comments
     where parent_id = new.id and is_official = true
  ) then
    return new;
  end if;

  select value into v_general from public.settings where key = 'general';
  v_lang := coalesce(v_general->>'defaultLanguage', 'bn');

  if v_lang = 'en' then
    v_template := coalesce(
      nullif(v_settings->>'autoAckTemplateEn', ''),
      'Thank you {name} for your comment. This is an automated message from BD24News.'
    );
  else
    v_template := coalesce(
      nullif(v_settings->>'autoAckTemplateBn', ''),
      'ধন্যবাদ {name}, আপনার মন্তব্যের জন্য। এটি বিডি২৪নিউজের স্বয়ংক্রিয় বার্তা।'
    );
  end if;

  v_content := left(replace(v_template, '{name}', left(coalesce(new.author, ''), 60)), 1000);

  insert into public.comments (article_id, author, content, status, is_official, parent_id)
  values (new.article_id, 'BD24News (Automated)', v_content, 'published', true, new.id);

  return new;
end;
$$;

drop trigger if exists comments_send_ack on public.comments;
create trigger comments_send_ack
after insert or update of status on public.comments
for each row execute function public.send_comment_acknowledgement();

-- One-time correction of existing counters (idempotent; skips rows that
-- already match so updated_at is not needlessly rewritten).
select set_config('bd24.preserve_updated_at', 'on', true);

with counts as (
  select a.id, count(c.id) as total
    from public.articles a
    left join public.comments c
      on c.status = 'published'
     and coalesce(c.is_official, false) = false
     and (c.article_id = a.id::text or c.article_id = a.slug)
   group by a.id
)
update public.articles a
   set comments_count = counts.total
  from counts
 where counts.id = a.id
   and a.comments_count is distinct from counts.total;

-- ----------------------------------------------------------------
-- Tighten RLS: comments are public only when published, and direct
-- inserts no longer bypass moderation. The RPC is the write path;
-- admins may still insert official replies directly.
-- ----------------------------------------------------------------
drop policy if exists comments_public_read on public.comments;
create policy comments_public_read on public.comments
  for select using (status = 'published' or public.is_admin());

drop policy if exists comments_public_insert on public.comments;

drop policy if exists comments_admin_insert on public.comments;
create policy comments_admin_insert on public.comments
  for insert with check (public.is_admin());

drop policy if exists comments_admin_update on public.comments;
create policy comments_admin_update on public.comments
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists comments_admin_delete on public.comments;
create policy comments_admin_delete on public.comments
  for delete using (public.is_admin());

select set_config('bd24.preserve_updated_at', 'off', true);
