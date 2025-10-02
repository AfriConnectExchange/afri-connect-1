-- Grant usage on the schema to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT, INSERT, UPDATE permissions on the profiles table to the authenticated role
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;

-- Drop existing RLS policies on the profiles table to ensure a clean state
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Create the correct SELECT RLS policy
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles
FOR SELECT
USING (true);

-- Create the correct UPDATE RLS policy
CREATE POLICY "Users can update their own profile."
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
