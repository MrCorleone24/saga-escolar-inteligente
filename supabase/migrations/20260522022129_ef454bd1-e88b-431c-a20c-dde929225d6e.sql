-- Alter lessons table to add planning fields
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS day_of_week INTEGER,
ADD COLUMN IF NOT EXISTS bncc_code TEXT,
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT;

-- Update RLS policies for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy for teachers/admins/schools to manage their own lessons
DROP POLICY IF EXISTS "Teachers can manage their own lessons" ON public.lessons;
CREATE POLICY "Teachers can manage their own lessons" 
ON public.lessons 
FOR ALL 
USING (
  auth.uid() = teacher_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'school')
  )
);

-- Policy for students to view lessons from their school/teacher
DROP POLICY IF EXISTS "Students can view assigned lessons" ON public.lessons;
CREATE POLICY "Students can view assigned lessons" 
ON public.lessons 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND (
      p.teacher_id = lessons.teacher_id OR 
      p.school_id = (SELECT school_id FROM profiles WHERE id = lessons.teacher_id)
    )
  )
);
