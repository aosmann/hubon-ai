-- Enable helpful extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Shared helper to maintain updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Profiles table keeps track of admin privileges per user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  is_admin boolean default false,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Profiles insert for authenticated users"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Templates catalogue shared across workspace
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image text not null default '',
  prompt text not null default '',
  fields jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create trigger templates_updated_at
  before update on public.templates
  for each row execute procedure public.handle_updated_at();

alter table public.templates enable row level security;

create policy "Templates readable by authenticated users"
  on public.templates
  for select
  using (auth.role() = 'authenticated');

create policy "Templates manageable by admins"
  on public.templates
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Brand style settings per user
create table if not exists public.brand_styles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create trigger brand_styles_updated_at
  before update on public.brand_styles
  for each row execute procedure public.handle_updated_at();

alter table public.brand_styles enable row level security;

create policy "Brand styles readable by owner"
  on public.brand_styles
  for select
  using (auth.uid() = user_id);

create policy "Brand styles upsert by owner"
  on public.brand_styles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Image history per user
create table if not exists public.image_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  template_name text,
  prompt text,
  form_values jsonb not null default '{}'::jsonb,
  image_url text not null,
  created_at timestamptz default timezone('utc', now())
);

alter table public.image_history enable row level security;

create policy "Image history readable by owner"
  on public.image_history
  for select
  using (auth.uid() = user_id);

create policy "Image history insert by owner"
  on public.image_history
  for insert
  with check (auth.uid() = user_id);

create policy "Image history delete by owner"
  on public.image_history
  for delete
  using (auth.uid() = user_id);
