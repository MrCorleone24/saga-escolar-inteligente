-- Fix search_path for functions
ALTER FUNCTION public.handle_new_user_role() SET search_path = public;
ALTER FUNCTION public.sync_profile_email() SET search_path = public;

-- Revoke execute from public/anon for these sensitive functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_profile_email() FROM PUBLIC;

-- Ensure profiles table has email column and it's unique
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create or update the trigger to sync email from auth.users to profiles
-- Note: This requires access to the auth schema which is usually limited, 
-- but we can try to use a trigger on the profiles table itself if we update it from the app,
-- OR use a more robust way if the platform allows.
-- For now, let's assume we update it during login/session check.

-- Set admin role for the specific email
-- If the profile doesn't exist yet, this won't do anything, so we'll also handle it in the code.
UPDATE public.profiles SET role = 'admin' WHERE email = 'jrseguim@gmail.com';
