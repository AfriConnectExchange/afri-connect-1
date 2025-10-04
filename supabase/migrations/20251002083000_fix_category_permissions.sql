
-- Grant SELECT permission on the categories table to authenticated users
GRANT SELECT ON TABLE public.categories TO authenticated;

-- Ensure RLS is enabled on the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop any existing SELECT policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow read access for all users" ON public.categories;

-- Create a single, correct policy to allow all users (anon and authenticated) to read categories
CREATE POLICY "Allow public read access for all users"
ON public.categories
FOR SELECT
USING (true);
