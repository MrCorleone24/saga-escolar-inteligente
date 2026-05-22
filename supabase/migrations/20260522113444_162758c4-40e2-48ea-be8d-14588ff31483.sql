-- Fix all SECURITY DEFINER functions to have search_path and revoke public execute
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

ALTER FUNCTION public.sync_profile_email() SET search_path = public;
REVOKE ALL ON FUNCTION public.sync_profile_email() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_profile_email() FROM anon, authenticated;

ALTER FUNCTION public.handle_new_user_role() SET search_path = public;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM anon, authenticated;

ALTER FUNCTION public.get_monthly_revenue() SET search_path = public;
REVOKE ALL ON FUNCTION public.get_monthly_revenue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_monthly_revenue() TO authenticated;

ALTER FUNCTION public.get_dashboard_stats() SET search_path = public;
REVOKE ALL ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

-- Ensure triggers are handled by supabase_auth_admin or similar if needed, 
-- but usually they run as the user trigger (so they need execute).
-- Actually, triggers on auth.users usually run as service_role.

-- Fix storage list policy again (make it more specific)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects 
FOR SELECT 
TO public 
USING ( bucket_id = 'notebook-assets' AND name IS NOT NULL );
