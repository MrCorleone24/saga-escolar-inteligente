-- 1. Create a security definer function to break the recursion
-- This function runs with the privileges of the creator (postgres/service_role)
-- and ignores RLS, allowing it to check the user's role safely.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Schools can view their members" ON public.profiles;

-- 3. Re-create policies using the helper function
-- Everyone can manage their own profile
CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins full access" 
ON public.profiles 
FOR ALL 
USING (public.get_my_role() = 'admin');

-- Schools can see their own data and their students/teachers
CREATE POLICY "Schools view members" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_my_role() = 'school' OR 
  school_id = auth.uid()
);

-- Teachers can see their own data and their students
CREATE POLICY "Teachers view students" 
ON public.profiles 
FOR SELECT 
USING (
  public.get_my_role() IN ('teacher', 'professor', 'teacher_solo', 'teacher_institutional') OR 
  teacher_id = auth.uid()
);

-- Ensure correct grants
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
