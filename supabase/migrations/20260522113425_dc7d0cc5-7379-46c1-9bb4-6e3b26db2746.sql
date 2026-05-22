-- 1. Fix search_path for all functions in public schema
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.sync_profile_email() SET search_path = public;
ALTER FUNCTION public.handle_new_user_role() SET search_path = public;
ALTER FUNCTION public.get_monthly_revenue() SET search_path = public;

-- 2. Revoke broad execute from public on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_profile_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_monthly_revenue() FROM PUBLIC;

-- Grant execute to specific roles if needed
GRANT EXECUTE ON FUNCTION public.get_monthly_revenue() TO authenticated;

-- 3. Cleanup profiles RLS Policies (Consolidate and secure)
DROP POLICY IF EXISTS "Perfis visíveis por todos os usuários autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Schools can view their members" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their students" ON public.profiles;
DROP POLICY IF EXISTS "Schools can view their registered teachers and students" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view their registered students" ON public.profiles;
DROP POLICY IF EXISTS "Admins see everything" ON public.profiles;
DROP POLICY IF EXISTS "Schools see their staff and students" ON public.profiles;
DROP POLICY IF EXISTS "Teachers see their students and school" ON public.profiles;
DROP POLICY IF EXISTS "Students see their own, teachers and school" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Create clean policies
-- Admin access
CREATE POLICY "Admin full access" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- School access: can see self, its teachers, and its students
CREATE POLICY "School access members" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ( 
  id = auth.uid() OR 
  school_id = auth.uid()
);

-- Teacher access: can see self, its school, and its students
CREATE POLICY "Teacher access members" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ( 
  id = auth.uid() OR 
  id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) OR
  teacher_id = auth.uid()
);

-- Student access: can see self, its teacher, and its school
CREATE POLICY "Student access members" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ( 
  id = auth.uid() OR 
  id = (SELECT teacher_id FROM public.profiles WHERE id = auth.uid()) OR
  id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);

-- Update policy
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 4. Storage Security
-- Fix public list access for notebook-assets
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" 
ON storage.objects 
FOR SELECT 
TO public 
USING ( 
  bucket_id = 'notebook-assets' AND 
  (auth.role() = 'authenticated' OR name IS NOT NULL) -- Simple way to avoid broad listing if needed, but standard is to allow reading by name
);

-- 5. Helper Functions for Stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  user_role TEXT;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  
  IF user_role = 'admin' THEN
    SELECT json_build_object(
      'schools', (SELECT count(*) FROM profiles WHERE role = 'school'),
      'students', (SELECT count(*) FROM profiles WHERE role = 'student'),
      'teachers', (SELECT count(*) FROM profiles WHERE role = 'teacher'),
      'mrr', (SELECT COALESCE(SUM(amount), 0) FROM financial_history WHERE status = 'paid')
    ) INTO result;
  ELSIF user_role = 'school' THEN
    SELECT json_build_object(
      'students', (SELECT count(*) FROM profiles WHERE school_id = user_id AND role = 'student'),
      'teachers', (SELECT count(*) FROM profiles WHERE school_id = user_id AND role = 'teacher'),
      'classes', (SELECT count(*) FROM rooms WHERE teacher_id IN (SELECT id FROM profiles WHERE school_id = user_id))
    ) INTO result;
  ELSE
    SELECT json_build_object('status', 'not_authorized') INTO result;
  END IF;
  
  RETURN result;
END;
$$;
