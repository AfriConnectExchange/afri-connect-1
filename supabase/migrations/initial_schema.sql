-- 1. Create the Profiles Table
-- This table will store public-facing user information.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email varchar(255),
  full_name text,
  phone_number text,
  location text,
  -- 1=Buyer, 2=Seller, 3=SME, 4=Trainer
  role_id int default 1,
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id),
  unique(email)
);

-- 2. Set up Row Level Security (RLS)
-- This ensures that users can only see and edit their own profile.
alter table public.profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);


-- 3. Create the Function to Handle New Users
-- This function will be triggered when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;


-- 4. Create the Trigger
-- This trigger will call the handle_new_user function after a new user is created in the auth.users table.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Enable real-time updates for the profiles table
-- (Optional, but useful for live updates in your app)
-- begin;
--   drop publication if exists supabase_realtime;
--   create publication supabase_realtime;
-- commit;
-- alter publication supabase_realtime add table public.profiles;

