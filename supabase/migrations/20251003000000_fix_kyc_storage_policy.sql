-- Drop the existing incorrect policies on the kyc_documents bucket
DROP POLICY IF EXISTS "KYC documents can be uploaded by authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;

-- Create the correct INSERT policy
CREATE POLICY "KYC documents can be uploaded by authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc_documents' AND
    split_part(name, '/', 1) = auth.uid()::text
);

-- Create the correct SELECT policy
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc_documents' AND
    split_part(name, '/', 1) = auth.uid()::text
);
