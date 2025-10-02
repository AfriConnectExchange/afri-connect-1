-- Enable Row Level Security on the 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to ensure a clean state
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON public.profiles;


-- Create policy: "Profiles are viewable by everyone."
-- This allows any user (authenticated or not) to read profile data.
-- This is necessary for displaying seller information on product pages.
CREATE POLICY "Profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);


-- Create policy: "Users can update their own profile."
-- This allows a logged-in user to update ONLY their own profile record.
-- The `auth.uid()` function returns the ID of the currently authenticated user.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- Note: Inserts are handled by the `handle_new_user` trigger, which runs with elevated privileges.
-- Direct inserts by users are not and should not be allowed by RLS for security.
-- Deletes should be handled by a specific, secure function if needed in the future.
