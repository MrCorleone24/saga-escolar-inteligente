-- Tabela de Vinculação de Professores (Grade Horária/Matérias)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    grade_level TEXT NOT NULL, -- Ex: "1º Ano", "2º EM"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Presença (Frequência)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('presente', 'falta', 'justificado')),
    marked_by UUID REFERENCES public.profiles(id),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendário Escolar Centralizado
CREATE TABLE IF NOT EXISTS public.school_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT CHECK (event_type IN ('feriado', 'reuniao', 'prova', 'evento', 'aula_extra')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas para teacher_assignments
CREATE POLICY "Escolas gerenciam seus vínculos" ON public.teacher_assignments
    FOR ALL USING (auth.uid() = school_id);

CREATE POLICY "Professores veem seus vínculos" ON public.teacher_assignments
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Admin vê tudo" ON public.teacher_assignments
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para attendance
CREATE POLICY "Professores marcam presença" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lessons l 
            WHERE l.id = attendance.lesson_id AND l.teacher_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND (p.role = 'school' OR p.role = 'admin')
        )
    );

CREATE POLICY "Alunos veem sua própria presença" ON public.attendance
    FOR SELECT USING (student_id = auth.uid());

-- Políticas para school_calendar_events
CREATE POLICY "Escolas gerenciam seu calendário" ON public.school_calendar_events
    FOR ALL USING (auth.uid() = school_id);

CREATE POLICY "Usuários vinculados veem calendário da escola" ON public.school_calendar_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() AND (p.school_id = school_calendar_events.school_id OR p.id = school_calendar_events.school_id)
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
