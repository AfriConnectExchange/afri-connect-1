-- Enable Row Level Security for the 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all profiles
-- This is necessary for users to see seller information, etc.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- Allow users to update their own profile
-- This is the key fix for the onboarding and profile edit functionality.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Restrict direct inserts (they are handled by the trigger)
-- This ensures data consistency.
CREATE POLICY "Users cannot insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (false);

-- Restrict direct deletes for now
-- This can be adjusted later with a more complex policy if needed.
CREATE POLICY "Users cannot delete their own profile."
ON public.profiles FOR DELETE
USING (false);
