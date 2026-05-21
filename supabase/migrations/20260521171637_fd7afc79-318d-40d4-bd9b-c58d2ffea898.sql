-- Add hierarchy columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS woovi_checkout_url TEXT;

-- Ensure plans table has checkout urls
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS checkout_url TEXT;

-- Add unique constraint to plan name if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plans_name_key') THEN
        ALTER TABLE public.plans ADD CONSTRAINT plans_name_key UNIQUE (name);
    END IF;
END $$;

-- Create performance_reports table
CREATE TABLE IF NOT EXISTS public.performance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade DECIMAL(4,2),
  attendance DECIMAL(5,2),
  engagement_score INTEGER DEFAULT 0,
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for performance reports
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

-- Policies for performance reports
DROP POLICY IF EXISTS "Users can view their own performance reports" ON public.performance_reports;
CREATE POLICY "Users can view their own performance reports"
ON public.performance_reports FOR SELECT
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can manage reports for their students" ON public.performance_reports;
CREATE POLICY "Teachers can manage reports for their students"
ON public.performance_reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND (p.role IN ('teacher', 'admin', 'school'))
  )
);

-- Update plans data with some mock Woovi links
INSERT INTO public.plans (name, description, price_monthly, max_students, max_teachers, role_type, features, checkout_url)
VALUES 
('Professor Solo', 'Ideal para professores particulares', 49.90, 50, 0, 'teacher', '["IA Pedagógica", "Gestão de Alunos", "Relatórios"]'::jsonb, 'https://woovi.com/checkout/teacher_solo'),
('Escola Essencial', 'Para pequenas escolas e centros', 299.00, 300, 15, 'school', '["IA Pedagógica", "Gestão de Professores", "Suporte"]'::jsonb, 'https://woovi.com/checkout/school_essencial'),
('Escola Premium', 'Para grandes instituições', 899.00, 1000, 50, 'school', '["IA Ilimitada", "Gestão Completa", "Relatórios de Rede"]'::jsonb, 'https://woovi.com/checkout/school_premium')
ON CONFLICT (name) DO UPDATE SET 
  checkout_url = EXCLUDED.checkout_url,
  features = EXCLUDED.features;

-- Update RLS for profiles to allow hierarchical viewing
DROP POLICY IF EXISTS "Schools can view their registered teachers and students" ON public.profiles;
CREATE POLICY "Schools can view their registered teachers and students"
ON public.profiles FOR SELECT
USING (auth.uid() = school_id OR id = auth.uid() OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers can view their registered students" ON public.profiles;
CREATE POLICY "Teachers can view their registered students"
ON public.profiles FOR SELECT
USING (auth.uid() = teacher_id OR id = auth.uid());
