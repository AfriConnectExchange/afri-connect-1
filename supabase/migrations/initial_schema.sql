-- ==================================================
-- COMPLETE AFRICONNECT PROFILE SYSTEM SCHEMA
-- ==================================================

-- Drop existing trigger and function to ensure a clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

-- 1. ROLES TABLE
-- Define user roles with permissions
create table if not exists public.roles (
  id int primary key,
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb
);

-- Clear existing roles and re-insert to ensure consistency
delete from public.roles;
insert into public.roles (id, name, description, permissions) values
(1, 'buyer', 'Can purchase products and services', '["browse", "purchase", "review"]'::jsonb),
(2, 'seller', 'Can sell products', '["browse", "purchase", "sell", "review"]'::jsonb),
(3, 'sme', 'Small/Medium Enterprise', '["browse", "purchase", "sell", "advertise", "analytics"]'::jsonb),
(4, 'trainer', 'Can create and manage courses', '["browse", "purchase", "teach", "create_courses"]'::jsonb),
(5, 'admin', 'Platform administrator', '["*"]'::jsonb);

-- 2. ENHANCED PROFILES TABLE
create table if not exists public.profiles (
  id uuid not null primary key,
  email varchar(255) unique,
  full_name text,
  phone_number text,
  location text,
  role_id int references public.roles(id) default 1,
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Make sure the table links to auth.users
alter table public.profiles 
  add constraint profiles_id_fkey 
  foreign key (id) 
  references auth.users(id) 
  on delete cascade;

-- 3. SIMPLIFIED & ROBUST USER CREATION FUNCTION
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    1 -- Always default to 'buyer' role on creation
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. CREATE THE TRIGGER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. ROW LEVEL SECURITY POLICIES
alter table public.profiles enable row level security;

-- Drop old policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Re-create policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
