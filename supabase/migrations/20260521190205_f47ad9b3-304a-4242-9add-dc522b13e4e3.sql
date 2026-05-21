-- Add social profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT;

-- Ensure rooms table has correct RLS for hierarchy
-- If you are a student, you can only see rooms created by your teacher or your school
-- If you are a teacher, you can see rooms created by your school or yourself
-- If you are a school or admin, you can see everything

-- First, let's check if the policy exists and update it
-- Actually, the current code just does .eq('is_active', true) in VideoSalas.tsx
-- We should enforce this at DB level for security

DROP POLICY IF EXISTS "Users can view relevant rooms" ON public.rooms;

CREATE POLICY "Users can view relevant rooms" ON public.rooms
FOR SELECT
USING (
  auth.uid() = created_by OR -- Creator
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND (
      p.role = 'admin' OR -- Admin sees all
      p.role = 'school' OR -- School sees all (could be narrowed to its own, but usually schools manage everything)
      (p.role = 'teacher' AND (rooms.created_by = p.id OR rooms.created_by = p.school_id)) OR -- Teacher sees own or school's
      (p.role = 'student' AND (rooms.created_by = p.teacher_id OR rooms.created_by = p.school_id)) -- Student sees teacher's or school's
    )
  )
);
