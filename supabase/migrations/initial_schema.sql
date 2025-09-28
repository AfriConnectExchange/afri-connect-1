-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  role_id int references roles(id) default 1,
  onboarding_completed boolean default false,
  location text
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for user roles
create table roles (
  id serial primary key,
  name text not null unique
);

-- Insert the roles
insert into roles (name) values ('buyer'), ('seller'), ('sme'), ('trainer');

-- This trigger automatically creates a profile for new users.
-- See https://supabase.com/docs/guides/auth/managing-user-data#creating-a-profile-for-each-user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add a function to get user role
create or replace function get_user_role()
returns text
language plpgsql
as $$
declare
  user_role text;
begin
  select r.name into user_role
  from profiles p
  join roles r on p.role_id = r.id
  where p.id = auth.uid();
  return user_role;
end;
$$;
