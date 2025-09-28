-- ==================================================
-- COMPLETE AFRICONNECT PROFILE SYSTEM SCHEMA
-- ==================================================

-- 1. ROLES TABLE
-- Define user roles with permissions
create table if not exists public.roles (
  id int primary key,
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb
);

-- Clear existing data to prevent insertion errors on re-run
delete from public.roles;

insert into public.roles (id, name, description, permissions) values
(1, 'buyer', 'Can purchase products and services', '["browse", "purchase", "review"]'::jsonb),
(2, 'seller', 'Can sell products', '["browse", "purchase", "sell", "review"]'::jsonb),
(3, 'sme', 'Small/Medium Enterprise', '["browse", "purchase", "sell", "advertise", "analytics"]'::jsonb),
(4, 'trainer', 'Can create and manage courses', '["browse", "purchase", "teach", "create_courses"]'::jsonb),
(5, 'admin', 'Platform administrator', '["*"]'::jsonb);

-- 2. COUNTRIES TABLE
create table if not exists public.countries (
  id serial primary key,
  name text not null,
  code varchar(3) not null unique, -- ISO code
  currency_code varchar(3),
  phone_prefix varchar(5)
);

-- Sample countries data
TRUNCATE public.countries RESTART IDENTITY;
insert into public.countries (name, code, currency_code, phone_prefix) values
('United Kingdom', 'GBR', 'GBP', '+44'),
('Nigeria', 'NGA', 'NGN', '+234'),
('Ghana', 'GHA', 'GHS', '+233'),
('Kenya', 'KEN', 'KES', '+254');


-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email varchar(255) unique,
  full_name text,
  phone_number text,
  date_of_birth date,
  gender varchar(20),
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  postal_code text,
  country_id int references public.countries(id),
  avatar_url text,
  cover_image_url text,
  role_id int references public.roles(id) default 1,
  account_status varchar(20) default 'active',
  kyc_status varchar(20) default 'pending',
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz default now(),
  primary key (id)
);


-- 4. ROW LEVEL SECURITY POLICIES
alter table public.profiles enable row level security;

-- Drop old policies before creating new ones to avoid errors on re-run
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 5. NEW USER TRIGGER FUNCTION (SIMPLIFIED & ROBUST)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;


-- 6. TRIGGER TO EXECUTE THE FUNCTION
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. UPDATE TIMESTAMP FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply update timestamp trigger
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 8. INDEXES FOR PERFORMANCE
create index if not exists idx_profiles_role_id on public.profiles(role_id);
create index if not exists idx_profiles_country_id on public.profiles(country_id);
create index if not exists idx_profiles_kyc_status on public.profiles(kyc_status);
create index if not exists idx_profiles_account_status on public.profiles(account_status);
