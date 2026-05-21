-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis (Profiles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('aluno', 'professor')) NOT NULL,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Disciplinas (Subjects)
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Aulas (Lessons)
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id),
    teacher_id UUID REFERENCES public.profiles(id),
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('interativa', 'caderno', 'mista', 'video')) NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'em andamento', 'concluída')) DEFAULT 'pendente',
    duration TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Entradas de Caderno (Notebook Entries)
CREATE TABLE public.notebook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id),
    subject_id UUID REFERENCES public.subjects(id),
    date DATE DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    content TEXT,
    photo_url TEXT,
    status TEXT CHECK (status IN ('rascunho', 'enviado', 'corrigido', 'devolvido', 'pendente', 'confirmado')) DEFAULT 'rascunho',
    grade TEXT,
    teacher_note TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Versões de Feedback (Feedback Versions)
CREATE TABLE public.feedback_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID REFERENCES public.notebook_entries(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    grade TEXT,
    note TEXT,
    status TEXT NOT NULL
);

-- 6. Tabela de Salas de Aula (Rooms)
CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    status TEXT CHECK (status IN ('online', 'offline')) DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Mensagens de Sala (Room Messages)
CREATE TABLE public.room_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Perfis
CREATE POLICY "Perfis visíveis por todos os usuários autenticados" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas de Disciplinas
CREATE POLICY "Disciplinas visíveis por todos" ON public.subjects FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de Aulas
CREATE POLICY "Aulas visíveis por todos" ON public.lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Aulas podem ser criadas por professores" ON public.lessons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor'));

-- Políticas de Entradas de Caderno
CREATE POLICY "Alunos veem suas próprias entradas" ON public.notebook_entries FOR SELECT USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor'));
CREATE POLICY "Alunos criam suas próprias entradas" ON public.notebook_entries FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Entradas atualizáveis pelo aluno ou professor" ON public.notebook_entries FOR UPDATE USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor'));

-- Políticas de Versões de Feedback
CREATE POLICY "Versões de feedback visíveis para o aluno e professor" ON public.feedback_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.notebook_entries e WHERE e.id = entry_id AND (e.student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'professor'))));

-- Políticas de Salas e Mensagens
CREATE POLICY "Salas visíveis por todos" ON public.rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas professores gerenciam salas" ON public.rooms FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor'));
CREATE POLICY "Mensagens visíveis por todos na sala" ON public.room_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Qualquer um pode enviar mensagem na sala" ON public.room_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Habilitar Realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notebook_entries_updated_at BEFORE UPDATE ON public.notebook_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Inserir Disciplinas Padrão
INSERT INTO public.subjects (name, color, emoji) VALUES
('Português', '217 91% 50%', '📖'),
('Matemática', '152 60% 42%', '🔢'),
('Ciências', '280 65% 55%', '🔬'),
('História', '38 92% 55%', '🏛️'),
('Geografia', '170 60% 45%', '🌍'),
('Inglês', '0 84% 60%', '🇺🇸'),
('Espanhol', '25 95% 53%', '🇪🇸'),
('Filosofia', '260 50% 55%', '🤔'),
('Sociologia', '200 55% 50%', '👥'),
('Educação Física', '120 55% 45%', '⚽'),
('Tecnologia e IA', '210 80% 55%', '🤖'),
('Empreendedorismo', '45 90% 50%', '🚀'),
('Leitura/Literatura', '340 65% 50%', '📚');
