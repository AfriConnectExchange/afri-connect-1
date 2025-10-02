-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies for the 'avatars' bucket
-- Allow public read access
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Authenticated users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Authenticated users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);


-- Set up Row Level Security (RLS) policies for the 'product_images' bucket
-- Allow public read access
CREATE POLICY "Public read access for product_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');

-- Allow authenticated users to upload product images
-- We will check ownership at the folder level. Assumes path is 'user_id/...'
CREATE POLICY "Authenticated users can upload product_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own product images
CREATE POLICY "Authenticated users can update their own product_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own product images
CREATE POLICY "Authenticated users can delete their own product_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product_images' AND auth.uid()::text = (storage.foldername(name))[1]);