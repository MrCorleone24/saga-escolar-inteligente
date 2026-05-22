-- Enable RLS on rooms if not enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Rooms are viewable by participants" ON public.rooms;
DROP POLICY IF EXISTS "Admins can do everything on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can view relevant rooms" ON public.rooms;
DROP POLICY IF EXISTS "Teachers and Schools can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Enable room visibility by hierarchy" ON public.rooms;

-- 1. Admins see everything
CREATE POLICY "Admins can do everything on rooms" 
ON public.rooms 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 2. View policy for non-admins
CREATE POLICY "Users can view relevant rooms" 
ON public.rooms 
FOR SELECT 
USING (
  created_by = auth.uid() OR -- Created by the user
  EXISTS (
    SELECT 1 FROM public.profiles p_me
    JOIN public.profiles p_creator ON p_creator.id = rooms.created_by
    WHERE p_me.id = auth.uid() 
    AND (
      -- Student viewing teacher's or school's room
      (p_me.role IN ('student', 'aluno') AND (p_me.teacher_id = p_creator.id OR p_me.school_id = p_creator.id)) OR
      -- Teacher viewing school's room
      (p_me.role IN ('teacher', 'professor') AND p_me.school_id = p_creator.id) OR
      -- School viewing teacher's room
      (p_me.role = 'school' AND p_creator.school_id = p_me.id)
    )
  )
);

-- 3. Insert policy
CREATE POLICY "Teachers and Schools can create rooms"
ON public.rooms
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'school', 'professor', 'admin')
  )
);

-- 4. Update/Delete policy
CREATE POLICY "Creators can manage their own rooms"
ON public.rooms
FOR ALL
USING (created_by = auth.uid());
