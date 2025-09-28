-- ==================================================
-- COMPLETE AFRICONNECT PROFILE SYSTEM SCHEMA
-- ==================================================

-- 1. ROLES TABLE
-- Define user roles with permissions
create table public.roles (
  id int primary key,
  name text not null unique,
  description text,
  permissions jsonb default '[]'::jsonb
);

insert into public.roles (id, name, description, permissions) values
(1, 'buyer', 'Can purchase products and services', '["browse", "purchase", "review"]'::jsonb),
(2, 'seller', 'Can sell products', '["browse", "purchase", "sell", "review"]'::jsonb),
(3, 'sme', 'Small/Medium Enterprise', '["browse", "purchase", "sell", "advertise", "analytics"]'::jsonb),
(4, 'trainer', 'Can create and manage courses', '["browse", "purchase", "teach", "create_courses"]'::jsonb),
(5, 'admin', 'Platform administrator', '["*"]'::jsonb);

-- 2. COUNTRIES & LOCATIONS
create table public.countries (
  id serial primary key,
  name text not null,
  code varchar(3) not null unique, -- ISO code
  currency_code varchar(3),
  phone_prefix varchar(5)
);

-- Sample countries data
insert into public.countries (name, code, currency_code, phone_prefix) values
('United Kingdom', 'GBR', 'GBP', '+44'),
('Nigeria', 'NGA', 'NGN', '+234'),
('Ghana', 'GHA', 'GHS', '+233'),
('Kenya', 'KEN', 'KES', '+254');

-- 3. ENHANCED PROFILES TABLE
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  
  -- Basic Info
  email varchar(255) unique,
  full_name text,
  phone_number text,
  date_of_birth date,
  gender varchar(20),
  
  -- Location
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  postal_code text,
  country_id int references public.countries(id),
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Profile Media
  avatar_url text,
  cover_image_url text,
  
  -- Role & Status
  role_id int references public.roles(id) default 1,
  secondary_roles int[] default '{}', -- For multiple roles
  account_status varchar(20) default 'active', -- active, suspended, deactivated
  
  -- KYC & Verification
  kyc_status varchar(20) default 'pending', -- pending, verified, rejected
  kyc_documents jsonb default '[]'::jsonb,
  identity_verified boolean default false,
  phone_verified boolean default false,
  email_verified boolean default false,
  
  -- Preferences
  language varchar(10) default 'en',
  timezone varchar(50) default 'UTC',
  currency_preference varchar(3) default 'GBP',
  
  -- Notification Settings
  notifications jsonb default '{
    "email_marketing": true,
    "email_orders": true,
    "email_security": true,
    "sms_orders": true,
    "sms_security": true,
    "push_orders": true,
    "push_marketing": false
  }'::jsonb,
  
  -- Privacy Settings
  privacy_settings jsonb default '{
    "profile_visibility": "public",
    "show_online_status": true,
    "show_location": true,
    "allow_messages": true
  }'::jsonb,
  
  -- Business Info (for SMEs/Sellers)
  business_name text,
  business_description text,
  business_registration_number text,
  business_type varchar(50),
  website_url text,
  
  -- Platform Stats
  reputation_score decimal(3,2) default 5.00,
  total_transactions int default 0,
  successful_transactions int default 0,
  completion_rate decimal(5,2) default 100.00,
  
  -- Onboarding & Help
  onboarding_completed boolean default false,
  onboarding_step int default 1,
  tour_completed boolean default false,
  
  -- Access Control
  free_access_expires_at timestamptz,
  subscription_tier varchar(20) default 'free',
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz default now(),
  
  primary key (id)
);

-- 4. PROFILE VERIFICATION DOCUMENTS
create table public.profile_documents (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type varchar(50) not null, -- 'identity', 'address_proof', 'business_license'
  document_url text not null,
  file_name text,
  file_size bigint,
  mime_type text,
  verification_status varchar(20) default 'pending', -- pending, approved, rejected
  verification_notes text,
  uploaded_at timestamptz default now(),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id)
);

-- 5. PROFILE PREFERENCES (Extended)
create table public.profile_preferences (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  category varchar(50) not null, -- 'notification', 'privacy', 'display', 'search'
  key varchar(100) not null,
  value text not null,
  created_at timestamptz default now(),
  
  unique(profile_id, category, key)
);

-- 6. PROFILE ACTIVITY LOG
create table public.profile_activity (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  activity_type varchar(50) not null, -- 'login', 'profile_update', 'kyc_upload', 'role_change'
  description text,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- 7. ROW LEVEL SECURITY POLICIES
alter table public.profiles enable row level security;
alter table public.profile_documents enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.profile_activity enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Documents policies
create policy "Users can view own documents" on public.profile_documents
  for select using (profile_id = auth.uid());

create policy "Users can insert own documents" on public.profile_documents
  for insert with check (profile_id = auth.uid());

create policy "Admins can view all documents" on public.profile_documents
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role_id = 5
    )
  );

-- Preferences policies
create policy "Users can manage own preferences" on public.profile_preferences
  for all using (profile_id = auth.uid());

-- Activity policies  
create policy "Users can view own activity" on public.profile_activity
  for select using (profile_id = auth.uid());

-- 8. ENHANCED USER CREATION FUNCTION
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  user_role_id int := 1; -- Default to buyer
begin
  -- Determine role from metadata
  if new.raw_user_meta_data->>'role' = 'seller' then
    user_role_id := 2;
  elsif new.raw_user_meta_data->>'role' = 'sme' then
    user_role_id := 3;
  elsif new.raw_user_meta_data->>'role' = 'trainer' then
    user_role_id := 4;
  end if;

  -- Insert profile
  insert into public.profiles (
    id, 
    email, 
    full_name,
    phone_number,
    role_id,
    free_access_expires_at,
    email_verified,
    onboarding_step
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    user_role_id,
    now() + interval '3 months', -- 3 month free access
    case when new.email_confirmed_at is not null then true else false end,
    1
  );

  -- Log the registration
  insert into public.profile_activity (
    profile_id,
    activity_type,
    description,
    metadata
  ) values (
    new.id,
    'registration',
    'User registered successfully',
    jsonb_build_object(
      'method', coalesce(new.raw_user_meta_data->>'provider', 'email'),
      'role', user_role_id
    )
  );

  return new;
end;
$$ language plpgsql security definer;

-- 9. UPDATE TIMESTAMP FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply update timestamp trigger
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 10. PROFILE COMPLETION FUNCTION
create or replace function public.calculate_profile_completion(profile_uuid uuid)
returns int as $$
declare
  completion_score int := 0;
  profile_record public.profiles%rowtype;
begin
  select * into profile_record from public.profiles where id = profile_uuid;
  
  if profile_record.full_name is not null and length(trim(profile_record.full_name)) > 0 then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.phone_number is not null then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.avatar_url is not null then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.address_line1 is not null then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.city is not null then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.country_id is not null then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.phone_verified then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.email_verified then
    completion_score := completion_score + 10;
  end if;
  
  if profile_record.kyc_status = 'verified' then
    completion_score := completion_score + 20;
  end if;

  return completion_score;
end;
$$ language plpgsql;

-- 11. USEFUL VIEWS
-- Profile summary view
create or replace view public.profile_summary as
select 
  p.id,
  p.full_name,
  p.avatar_url,
  p.reputation_score,
  p.total_transactions,
  p.completion_rate,
  r.name as role_name,
  c.name as country_name,
  public.calculate_profile_completion(p.id) as completion_percentage,
  case 
    when p.last_active_at > now() - interval '5 minutes' then 'online'
    when p.last_active_at > now() - interval '1 hour' then 'recently_active'
    else 'offline'
  end as online_status
from public.profiles p
left join public.roles r on p.role_id = r.id
left join public.countries c on p.country_id = c.id;

-- 12. INDEXES FOR PERFORMANCE
create index idx_profiles_role_id on public.profiles(role_id);
create index idx_profiles_country_id on public.profiles(country_id);
create index idx_profiles_kyc_status on public.profiles(kyc_status);
create index idx_profiles_account_status on public.profiles(account_status);
create index idx_profiles_location on public.profiles using gist(ll_to_earth(latitude, longitude)) where latitude is not null and longitude is not null;
create index idx_profiles_last_active on public.profiles(last_active_at desc);
create index idx_profile_activity_profile_id on public.profile_activity(profile_id);
create index idx_profile_activity_type on public.profile_activity(activity_type);
create index idx_profile_documents_profile_id on public.profile_documents(profile_id);

-- 13. ENABLE REALTIME
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.profile_activity;

-- This trigger is crucial for the handle_new_user function to work.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
