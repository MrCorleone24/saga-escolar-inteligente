-- Enable RLS on rooms if not already enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view relevant rooms" ON public.rooms;
DROP POLICY IF EXISTS "Teachers and schools can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Owners can update their rooms" ON public.rooms;

-- Create policy for viewing rooms based on hierarchy
CREATE POLICY "Users can view relevant rooms" 
ON public.rooms 
FOR SELECT 
USING (
  -- Admins see everything
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR 
  -- Creators see their own rooms
  created_by = auth.uid()
  OR
  -- Students see rooms from their teacher or school
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role = 'student'
    AND (p.teacher_id = public.rooms.created_by OR p.school_id = public.rooms.created_by)
  )
  OR
  -- Teachers see rooms from their school
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'teacher'
    AND p.school_id = public.rooms.created_by
  )
);

-- Create policy for creating rooms
CREATE POLICY "Teachers and schools can create rooms" 
ON public.rooms 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('teacher', 'school', 'admin')
  )
);

-- Create policy for updating/deleting rooms
CREATE POLICY "Owners and admins can manage rooms" 
ON public.rooms 
FOR ALL
USING (
  created_by = auth.uid() 
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
