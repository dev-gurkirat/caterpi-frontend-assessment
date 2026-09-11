-- Caterpi Skills Passport schema for the local test project.
-- Run this in Supabase: SQL Editor → New query → Run.
-- Re-run is safe when adding storage/evidence updates.
-- Use only the public anon key in the Next.js app. Never put service_role in the frontend.

create extension if not exists pgcrypto;

create table if not exists public.capabilities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table if not exists public.talents (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  role text,
  is_public boolean not null default false,
  email text
);

create table if not exists public.talent_capabilities (
  talent_id uuid not null references public.talents (id) on delete cascade,
  capability_id uuid not null references public.capabilities (id) on delete cascade,
  score numeric,
  primary key (talent_id, capability_id)
);

create table if not exists public.capability_levels (
  talent_id uuid not null references public.talents (id) on delete cascade,
  capability_id uuid not null references public.capabilities (id) on delete cascade,
  level integer not null check (level between 1 and 3),
  status text not null default 'not_attempted',
  primary key (talent_id, capability_id, level)
);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talents (id) on delete cascade,
  capability_id uuid not null references public.capabilities (id) on delete cascade,
  title text,
  verification_level integer check (verification_level between 1 and 3),
  score numeric,
  verification_status text,
  submitted_at timestamptz,
  assessor_status text
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessment_results (id) on delete cascade,
  storage_path text,
  expires_at timestamptz
);

insert into public.capabilities (slug, name)
values
  ('paid-media', 'Paid Media'),
  ('seo', 'SEO'),
  ('content-marketing', 'Content Marketing'),
  ('analytics', 'Analytics'),
  ('social-media', 'Social Media'),
  ('marketing-strategy', 'Marketing Strategy')
on conflict (slug) do nothing;

alter table public.talents enable row level security;
alter table public.capabilities enable row level security;
alter table public.talent_capabilities enable row level security;
alter table public.capability_levels enable row level security;
alter table public.assessment_results enable row level security;
alter table public.evidence enable row level security;

drop policy if exists talents_select_own_or_public on public.talents;
create policy talents_select_own_or_public
  on public.talents for select
  using (id = auth.uid() or is_public = true);

drop policy if exists talents_insert_own on public.talents;
create policy talents_insert_own
  on public.talents for insert
  with check (id = auth.uid());

drop policy if exists talents_update_own on public.talents;
create policy talents_update_own
  on public.talents for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists capabilities_read on public.capabilities;
create policy capabilities_read
  on public.capabilities for select
  using (true);

drop policy if exists talent_capabilities_select on public.talent_capabilities;
create policy talent_capabilities_select
  on public.talent_capabilities for select
  using (
    talent_id = auth.uid()
    or exists (
      select 1 from public.talents t
      where t.id = talent_id and t.is_public = true
    )
  );

drop policy if exists capability_levels_select on public.capability_levels;
create policy capability_levels_select
  on public.capability_levels for select
  using (
    talent_id = auth.uid()
    or exists (
      select 1 from public.talents t
      where t.id = talent_id and t.is_public = true
    )
  );

drop policy if exists assessment_results_select_own on public.assessment_results;
create policy assessment_results_select_own
  on public.assessment_results for select
  using (talent_id = auth.uid());

drop policy if exists evidence_select_own on public.evidence;
create policy evidence_select_own
  on public.evidence for select
  using (
    exists (
      select 1 from public.assessment_results a
      where a.id = assessment_id and a.talent_id = auth.uid()
    )
  );

create or replace function public.seed_demo_evidence_for(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  assess_seo_1 uuid;
  assess_seo_2 uuid;
  assess_content uuid;
begin
  if uid is null then
    return;
  end if;

  if exists (
    select 1
    from public.evidence e
    join public.assessment_results a on a.id = e.assessment_id
    where a.talent_id = uid
  ) then
    return;
  end if;

  select id into assess_seo_1
  from public.assessment_results
  where talent_id = uid and title = 'SEO fundamentals practical'
  limit 1;

  select id into assess_seo_2
  from public.assessment_results
  where talent_id = uid and title = 'SEO applied project'
  limit 1;

  select id into assess_content
  from public.assessment_results
  where talent_id = uid and title = 'Content strategy briefing'
  limit 1;

  if assess_seo_1 is null and assess_seo_2 is null and assess_content is null then
    return;
  end if;

  if assess_seo_1 is not null then
    insert into public.evidence (assessment_id, storage_path, expires_at)
    values (assess_seo_1, uid::text || '/seo-fundamentals.txt', null);
  end if;

  if assess_seo_2 is not null then
    insert into public.evidence (assessment_id, storage_path, expires_at)
    values (assess_seo_2, null, null);
  end if;

  if assess_content is not null then
    insert into public.evidence (assessment_id, storage_path, expires_at)
    values
      (assess_content, uid::text || '/expired-content.txt', timestamptz '2020-01-01 00:00:00+00'),
      (assess_content, uid::text || '/not-in-storage.pdf', null);
  end if;
end;
$$;

create or replace function public.seed_demo_passport_for(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  user_name text;
  cap_paid uuid;
  cap_seo uuid;
  cap_content uuid;
  cap_analytics uuid;
  cap_social uuid;
  cap_strategy uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into user_email from auth.users where id = uid;
  user_name := lower(split_part(coalesce(user_email, 'talent'), '@', 1));
  user_name := regexp_replace(user_name, '[^a-z0-9]+', '-', 'g');
  user_name := trim(both '-' from user_name);
  if user_name = '' then
    user_name := 'talent';
  end if;
  if exists (select 1 from public.talents where username = user_name and id <> uid) then
    user_name := user_name || '-' || substr(replace(uid::text, '-', ''), 1, 8);
  end if;

  insert into public.talents (id, username, display_name, role, is_public, email)
  values (
    uid,
    user_name,
    initcap(replace(split_part(coalesce(user_email, 'talent'), '@', 1), '.', ' ')),
    'Marketing specialist',
    false,
    user_email
  )
  on conflict (id) do nothing;

  if exists (select 1 from public.talent_capabilities where talent_id = uid) then
    perform public.seed_demo_evidence_for(uid);
    return;
  end if;

  select id into cap_paid from public.capabilities where slug = 'paid-media';
  select id into cap_seo from public.capabilities where slug = 'seo';
  select id into cap_content from public.capabilities where slug = 'content-marketing';
  select id into cap_analytics from public.capabilities where slug = 'analytics';
  select id into cap_social from public.capabilities where slug = 'social-media';
  select id into cap_strategy from public.capabilities where slug = 'marketing-strategy';

  if cap_paid is null or cap_seo is null or cap_content is null
     or cap_analytics is null or cap_social is null or cap_strategy is null then
    raise exception 'Capability catalogue is missing. Run supabase/schema.sql first.';
  end if;

  insert into public.talent_capabilities (talent_id, capability_id, score) values
    (uid, cap_paid, 78),
    (uid, cap_seo, 63),
    (uid, cap_content, 84),
    (uid, cap_analytics, 58),
    (uid, cap_social, 91),
    (uid, cap_strategy, null);

  insert into public.capability_levels (talent_id, capability_id, level, status) values
    (uid, cap_paid, 1, 'verified'),
    (uid, cap_paid, 2, 'verified'),
    (uid, cap_paid, 3, 'not_attempted'),
    (uid, cap_seo, 1, 'verified'),
    (uid, cap_seo, 2, 'verified'),
    (uid, cap_seo, 3, 'not_attempted'),
    (uid, cap_content, 1, 'verified'),
    (uid, cap_content, 2, 'verified'),
    (uid, cap_content, 3, 'verified'),
    (uid, cap_analytics, 1, 'verified'),
    (uid, cap_social, 1, 'verified'),
    (uid, cap_social, 2, 'verified'),
    (uid, cap_social, 3, 'verified');

  insert into public.assessment_results (
    talent_id, capability_id, title, verification_level, score, verification_status, submitted_at, assessor_status
  ) values
    (uid, cap_seo, 'SEO fundamentals practical', 1, 70, 'verified', timestamptz '2026-03-12 09:00:00+00', 'Approved'),
    (uid, cap_seo, 'SEO applied project', 2, 63, 'verified', timestamptz '2026-05-04 11:30:00+00', 'Approved'),
    (uid, cap_content, 'Content strategy briefing', 1, 84, 'verified', timestamptz '2026-04-18 14:00:00+00', 'Approved');

  perform public.seed_demo_evidence_for(uid);
end;
$$;

create or replace function public.seed_demo_passport()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_demo_passport_for(auth.uid());
end;
$$;

create or replace function public.seed_demo_evidence()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_demo_evidence_for(auth.uid());
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_demo_passport_for(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select on public.capabilities to anon, authenticated;
revoke all on public.talents from public, anon, authenticated;
grant select (id, username, display_name, role, is_public)
  on public.talents to anon, authenticated;
grant insert (id, username, display_name, role, is_public)
  on public.talents to authenticated;
grant update (username, display_name, role, is_public)
  on public.talents to authenticated;
grant select on public.talent_capabilities to anon, authenticated;
grant select on public.capability_levels to anon, authenticated;
grant select on public.assessment_results to authenticated;
grant select on public.evidence to authenticated;
grant execute on function public.seed_demo_passport() to authenticated;
grant execute on function public.seed_demo_evidence() to authenticated;
revoke all on function public.seed_demo_passport_for(uuid) from public, anon, authenticated;
revoke all on function public.seed_demo_evidence_for(uuid) from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values ('evidence', 'evidence', false, 5242880)
on conflict (id) do update
set public = excluded.public;

drop policy if exists evidence_objects_select_own on storage.objects;
create policy evidence_objects_select_own
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'evidence'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists evidence_objects_insert_own on storage.objects;
create policy evidence_objects_insert_own
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'evidence'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists evidence_objects_update_own on storage.objects;
create policy evidence_objects_update_own
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'evidence'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'evidence'
    and split_part(name, '/', 1) = auth.uid()::text
  );
