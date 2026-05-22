-- Extend profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS teacher_category TEXT CHECK (teacher_category IN ('solo', 'institutional')),
ADD COLUMN IF NOT EXISTS enrollment_id TEXT UNIQUE;

-- Financial transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id),
    school_id UUID REFERENCES public.profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Student Notebooks
CREATE TABLE IF NOT EXISTS public.student_notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id),
    teacher_id UUID REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    content JSONB DEFAULT '[]',
    teacher_feedback TEXT,
    grade DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.student_notebooks ENABLE ROW LEVEL SECURITY;

-- RLS Update
DROP POLICY IF EXISTS "Rooms hierarchy isolation" ON public.rooms;
CREATE POLICY "Rooms hierarchy isolation" ON public.rooms
FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'school' AND p.id = rooms.created_by) OR
    EXISTS (SELECT 1 FROM public.room_invitations i WHERE i.room_id = rooms.id AND i.invited_user_id = auth.uid())
);

DROP POLICY IF EXISTS "Profiles hierarchy isolation" ON public.profiles;
CREATE POLICY "Profiles hierarchy isolation" ON public.profiles
FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'school') AND school_id = auth.uid())
);

DROP POLICY IF EXISTS "Financial visibility" ON public.financial_transactions;
CREATE POLICY "Financial visibility" ON public.financial_transactions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR
    profile_id = auth.uid() OR
    school_id = auth.uid()
);

DROP POLICY IF EXISTS "Notebooks visibility" ON public.student_notebooks;
CREATE POLICY "Notebooks visibility" ON public.student_notebooks
FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin') OR
    (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'school') AND EXISTS (SELECT 1 FROM public.profiles s WHERE s.id = student_id AND s.school_id = auth.uid()))
);
