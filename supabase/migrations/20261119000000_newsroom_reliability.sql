begin;

create function public.newsroom_mfa_verified() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (auth.jwt()->>'aal' = 'aal2' or not exists (
    select 1 from auth.mfa_factors where user_id = auth.uid() and status = 'verified'
  ));
$$;

-- Existing self-editable profile roles require fresh administrator confirmation.
alter table public.profiles add column newsroom_role_confirmed boolean not null default false;
update public.profiles set newsroom_role_confirmed=true
where id in ('905e2a90-3e47-40ca-ad98-57d7d1fbd319','304673b9-c910-4e3f-864c-155f3d743e64')
  and lower(role) in ('admin','administrator');

-- Only administrators can change role assignments. Keep owners' cosmetic edits.
create function public.protect_profile_assignment() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') and not public.is_admin() and
     (new.id, new.email, new.role, new.status, new.newsroom_role_confirmed) is distinct from
     (old.id, old.email, old.role, old.status, old.newsroom_role_confirmed) then
    raise exception 'Administrator access required';
  end if;
  return new;
end;
$$;
create trigger protect_profile_assignment before update on public.profiles
for each row execute function public.protect_profile_assignment();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.newsroom_mfa_verified() and exists (
    select 1 from public.profiles where id=auth.uid() and status='active'
    and newsroom_role_confirmed and lower(role) in ('administrator','admin')
  );
$$;

create function public.newsroom_permission(capability text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or (public.newsroom_mfa_verified() and exists (
    select 1 from public.profiles p join public.roles r on lower(p.role) = r.slug
    where p.id=auth.uid() and p.status='active' and p.newsroom_role_confirmed and r.permissions ? capability
  ));
$$;
alter table public.articles add column newsroom_owner uuid default auth.uid();
create policy newsroom_drafts_read on public.articles for select using
  (public.newsroom_permission('news:publish') or (newsroom_owner=auth.uid() and public.newsroom_permission('news:write')));
create policy newsroom_insert on public.articles for insert with check
  (public.newsroom_permission('news:publish') or (status='draft' and newsroom_owner=auth.uid() and public.newsroom_permission('news:write')));
create policy newsroom_edit on public.articles for update using
  (public.newsroom_permission('news:publish') or (status='draft' and newsroom_owner=auth.uid() and public.newsroom_permission('news:write')))
  with check (public.newsroom_permission('news:publish') or (status='draft' and newsroom_owner=auth.uid() and public.newsroom_permission('news:write')));
create policy newsroom_delete on public.articles for delete using (public.newsroom_permission('news:delete'));

create function public.newsroom_capabilities() returns jsonb
language sql stable security definer set search_path = '' as $$
  select case when public.is_admin() then '["*"]'::jsonb
    when public.newsroom_mfa_verified() then coalesce((
      select r.permissions from public.profiles p join public.roles r on lower(p.role)=r.slug
      where p.id=auth.uid() and p.status='active' and p.newsroom_role_confirmed
    ), '[]'::jsonb) else '[]'::jsonb end;
$$;
create policy newsroom_media_upload on public.media for insert with check
  (public.newsroom_permission('media:upload') or public.newsroom_permission('media:manage'));
create policy newsroom_media_edit on public.media for update using(public.newsroom_permission('media:manage'));
create policy newsroom_media_delete on public.media for delete using(public.newsroom_permission('media:manage'));
create policy newsroom_storage_upload on storage.objects for insert with check
  (bucket_id='media' and (public.newsroom_permission('media:upload') or public.newsroom_permission('media:manage')));
create policy newsroom_storage_edit on storage.objects for update using(bucket_id='media' and public.newsroom_permission('media:manage'));
create policy newsroom_storage_delete on storage.objects for delete using(bucket_id='media' and public.newsroom_permission('media:manage'));
create policy newsroom_moderation on public.comments for all using(public.newsroom_permission('comments:moderate'))
  with check(public.newsroom_permission('comments:moderate'));

create function public.assign_newsroom_user(account_email text, display_name text, assigned_role text, account_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare account_id uuid;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select id into strict account_id from auth.users where lower(email)=lower(trim(account_email));
  insert into public.profiles(id,email,name,role,status,newsroom_role_confirmed) values(account_id,lower(trim(account_email)),display_name,assigned_role,account_status,true);
end;
$$;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check(length(name) between 2 and 150),
  email text not null check(length(email) between 3 and 320 and position('@' in email)>1),
  subject text not null check(length(subject) between 3 and 250),
  message text not null check(length(message) between 10 and 10000),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
grant insert(name,email,subject,message) on public.contact_messages to anon, authenticated;
grant select on public.contact_messages to authenticated;
create policy contact_submit on public.contact_messages for insert with check(true);
create policy contact_admin_manage on public.contact_messages for all using(public.is_admin()) with check(public.is_admin());
grant update, insert on public.contact_messages to authenticated;

create function public.newsroom_archive_years() returns setof integer
language sql stable security invoker set search_path = '' as $$
  select distinct extract(year from published_at at time zone 'Asia/Dhaka')::integer
  from public.articles where status='published' and published_at is not null order by 1 desc;
$$;
create function public.newsroom_view_days(since_at timestamptz)
returns table(day date, views bigint) language sql stable security definer set search_path = '' as $$
  select (created_at at time zone 'Asia/Dhaka')::date, count(*)
  from public.article_views where public.is_admin() and created_at >= since_at group by 1 order by 1;
$$;

-- Every table is restored in one transaction. Only allow expected tables and actual columns.
create function public.restore_newsroom_snapshot(snapshot jsonb) returns bigint
language plpgsql security invoker set search_path = '' as $$
declare
  tbl text;
  pk text;
  cols text;
  updates text;
  affected bigint;
  written bigint := 0;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  foreach tbl in array array['articles','categories','tags','authors','profiles','roles','ads','subscribers','comments','newsletters','settings','media','contact_messages','newsletter_deliveries'] loop
    if tbl in ('contact_messages','newsletter_deliveries') and not snapshot ? tbl then continue; end if;
    if jsonb_typeof(snapshot->tbl) is distinct from 'array' then raise exception 'Missing table %', tbl; end if;
    if jsonb_array_length(snapshot->tbl)=0 then continue; end if;
    pk := case when tbl='settings' then 'key' when tbl='newsletter_deliveries' then 'campaign_id,email' else 'id' end;
    select string_agg(format('%I',column_name),', ' order by ordinal_position),
           string_agg(format('%1$I=excluded.%1$I',column_name),', ' order by ordinal_position) filter(where column_name <> all(string_to_array(pk,',')))
    into cols, updates from information_schema.columns
    where table_schema='public' and table_name=tbl and (snapshot->tbl->0) ? column_name;
    execute format('insert into public.%1$I (%2$s) select %2$s from jsonb_populate_recordset(null::public.%1$I,$1)
                    on conflict (%3$s) do update set %4$s',tbl,cols,pk,updates) using snapshot->tbl;
    get diagnostics affected = row_count;
    written := written + affected;
  end loop;
  return written;
end;
$$;
revoke all on function public.restore_newsroom_snapshot(jsonb), public.assign_newsroom_user(text,text,text,text), public.newsroom_view_days(timestamptz) from public;
grant execute on function public.restore_newsroom_snapshot(jsonb), public.assign_newsroom_user(text,text,text,text), public.newsroom_view_days(timestamptz) to authenticated;

alter table public.newsletters add column delivery_started_at timestamptz, add column scheduled_for timestamptz;
create table public.newsletter_deliveries (
  campaign_id uuid references public.newsletters(id) on delete cascade,
  email text not null, provider_id text, primary key(campaign_id,email)
);
alter table public.newsletter_deliveries enable row level security;
create policy delivery_admin on public.newsletter_deliveries for all using(public.is_admin()) with check(public.is_admin());
grant select,insert,update on public.newsletter_deliveries to authenticated;

create function public.start_newsletter_delivery(campaign uuid, schedule boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare row_data public.newsletters;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  select * into strict row_data from public.newsletters where id=campaign for update;
  if row_data.status <> 'draft' or row_data.delivery_started_at is not null then return; end if;
  if length(trim(row_data.body))=0 then raise exception 'The message body is empty'; end if;
  insert into public.newsletter_deliveries(campaign_id,email)
    select campaign,email from public.subscribers where status='active';
  if not found then raise exception 'No active subscribers'; end if;
  update public.newsletters set delivery_started_at=now(),
    scheduled_for=case when schedule then now()+interval '1 day' end,
    recipients=(select count(*) from public.newsletter_deliveries where campaign_id=campaign)
  where id=campaign;
end;
$$;
revoke all on function public.start_newsletter_delivery(uuid,boolean) from public;
grant execute on function public.start_newsletter_delivery(uuid,boolean) to authenticated;
commit;
