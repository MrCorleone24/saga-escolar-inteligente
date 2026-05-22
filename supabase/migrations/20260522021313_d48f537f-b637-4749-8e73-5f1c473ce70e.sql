-- Adicionar novas colunas à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS special_needs_expert BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS grade_level TEXT,
ADD COLUMN IF NOT EXISTS class_schedule JSONB,
ADD COLUMN IF NOT EXISTS has_special_needs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Atualizar políticas de RLS para profiles
-- Remover políticas antigas se necessário (ajustar conforme nomes reais)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Nova política: Administradores veem tudo
CREATE POLICY "Admins see everything" 
ON public.profiles FOR SELECT 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- Escolas veem seus professores e alunos
CREATE POLICY "Schools see their staff and students" 
ON public.profiles FOR SELECT 
USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school' 
    AND (school_id = auth.uid() OR id = auth.uid())
);

-- Professores veem seus alunos e o perfil da escola vinculada
CREATE POLICY "Teachers see their students and school" 
ON public.profiles FOR SELECT 
USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('professor', 'teacher')
    AND (teacher_id = auth.uid() OR id = school_id OR id = auth.uid())
);

-- Alunos veem seu próprio perfil, seus professores e sua escola
CREATE POLICY "Students see their own, teachers and school" 
ON public.profiles FOR SELECT 
USING ( 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('aluno', 'student')
    AND (id = auth.uid() OR id = teacher_id OR id = school_id)
);

-- Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
