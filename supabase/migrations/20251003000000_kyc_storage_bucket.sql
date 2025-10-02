-- Create a new bucket for KYC documents with appropriate security policies.
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow users to upload to their own folder in the kyc_documents bucket.
-- The folder is created based on the user's UID.
CREATE POLICY "Allow authenticated users to upload to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc_documents' AND
  (storage.folder(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own files in the kyc_documents bucket.
CREATE POLICY "Allow authenticated users to view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (storage.folder(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own files.
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kyc_documents' AND
  (storage.folder(name))[1] = auth.uid()::text
);
