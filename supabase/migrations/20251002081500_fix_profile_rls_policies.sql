-- Drop existing policies to ensure a clean slate and avoid "already exists" errors.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Create the policy to allow public read access to all profiles.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- Create the policy to allow a user to update ONLY their own profile.
-- This uses the `auth.uid()` function to match the user's session ID with the profile's ID.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
