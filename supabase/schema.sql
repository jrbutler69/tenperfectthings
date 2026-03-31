-- ============================================
-- Ten Perfect Things — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  slug text unique,

  -- Personal info
  name text not null,
  email text not null,
  photo_url text,
  bio text not null,
  location text not null,
  occupation text not null,
  website text,

  -- Ten Questions (JSON array of 10 strings)
  question_answers jsonb not null default '[]'::jsonb,

  -- Clothing picks (JSON object keyed by category)
  clothing_picks jsonb not null default '{}'::jsonb
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-generate slug from name on insert
create or replace function generate_slug(name text)
returns text as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  while exists (select 1 from profiles where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  end loop;

  return final_slug;
end;
$$ language plpgsql;

create or replace function set_profile_slug()
returns trigger as $$
begin
  if new.slug is null then
    new.slug := generate_slug(new.name);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_slug
  before insert on profiles
  for each row execute function set_profile_slug();

-- Storage bucket for profile photos
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict do nothing;

-- Storage policies
create policy "Anyone can upload profile photos"
  on storage.objects for insert
  with check (bucket_id = 'profile-photos');

create policy "Public read profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

-- RLS policies
alter table profiles enable row level security;

create policy "Public read published profiles"
  on profiles for select
  using (status = 'published');

create policy "Anyone can submit a profile"
  on profiles for insert
  with check (status = 'pending');

create policy "Admins can update profiles"
  on profiles for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete profiles"
  on profiles for delete
  using (auth.role() = 'authenticated');

create policy "Admins can read all profiles"
  on profiles for select
  using (auth.role() = 'authenticated');