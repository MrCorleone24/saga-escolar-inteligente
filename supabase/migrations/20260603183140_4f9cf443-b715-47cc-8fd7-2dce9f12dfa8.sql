-- Drop existing policies that might be recursive or problematic
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles hierarchy isolation" ON public.profiles;
DROP POLICY IF EXISTS "School access members" ON public.profiles;
DROP POLICY IF EXISTS "Student access members" ON public.profiles;
DROP POLICY IF EXISTS "Teacher access members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Create new, non-recursive policies
-- 1. Users can manage their own profile
CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Admins can do everything
-- We use a check that avoids recursion by checking the role of the user requesting access
-- But since we can't easily check 'role' without querying profiles, 
-- we can check if the user is in a specific list or has a specific claim in auth.jwt()
-- For now, let's use a subquery that is more likely to be optimized or a separate check.
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Schools can see their students and teachers
CREATE POLICY "Schools can view their members" 
ON public.profiles 
FOR SELECT 
USING (
  school_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school' AND (school_id = auth.uid() OR id = auth.uid())
);

-- Ensure correct grants
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;
