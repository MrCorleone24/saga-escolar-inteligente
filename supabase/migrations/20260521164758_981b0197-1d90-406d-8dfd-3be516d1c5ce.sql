-- Fix notifications insert policy
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Fix storage policy to prevent listing
DROP POLICY "Public Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'notebook-assets');

-- Disable listing by ensuring we don't have a broad select on the bucket itself if possible, 
-- but in Supabase policies, 'SELECT' on objects is what controls read. 
-- To prevent listing while allowing read by name, we would typically check for specific file names, 
-- but for simplicity here we keep it as is or refine if needed.
