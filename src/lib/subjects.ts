import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export interface FeedbackVersion {
  id: string;
  date: string;
  grade: string;
  note: string;
  status: "corrigido" | "devolvido" | "confirmado";
}

export interface NotebookEntry {
  id: string;
  student_id: string;
  date: string;
  subject: string;
  title: string;
  content: string;
  photo_url: string | null;
  status: "rascunho" | "enviado" | "corrigido" | "devolvido" | "pendente" | "confirmado";
  grade?: string;
  teacher_note?: string;
  lesson_id?: string;
  confirmed_at?: string;
  file_urls?: string[];
  versions?: FeedbackVersion[];

}

export interface LessonLink {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: "interativa" | "caderno" | "mista" | "video";
  teacher: string;
  duration: string;
  progress: number;
  status: "pendente" | "em andamento" | "concluída";
}

export const SUBJECTS: Subject[] = [
  { id: "1", name: "Português", color: "217 91% 50%", emoji: "📖" },
  { id: "2", name: "Matemática", color: "152 60% 42%", emoji: "🔢" },
  { id: "3", name: "Ciências", color: "280 65% 55%", emoji: "🔬" },
  { id: "4", name: "História", color: "38 92% 55%", emoji: "🏛️" },
  { id: "5", name: "Geografia", color: "170 60% 45%", emoji: "🌍" },
  { id: "6", name: "Inglês", color: "0 84% 60%", emoji: "🇺🇸" },
  { id: "7", name: "Espanhol", color: "25 95% 53%", emoji: "🇪🇸" },
  { id: "8", name: "Filosofia", color: "260 50% 55%", emoji: "🤔" },
  { id: "9", name: "Sociologia", color: "200 55% 50%", emoji: "👥" },
  { id: "10", name: "Educação Física", color: "120 55% 45%", emoji: "⚽" },
  { id: "11", name: "Tecnologia e IA", color: "210 80% 55%", emoji: "🤖" },
  { id: "12", name: "Empreendedorismo", color: "45 90% 50%", emoji: "🚀" },
  { id: "13", name: "Leitura/Literatura", color: "340 65% 50%", emoji: "📚" },
];

export const MOCK_LESSONS: LessonLink[] = [
  { id: "1", title: "Texto Narrativo - A Formiguinha e a Neve", subject: "Português", date: "27/02/2026", type: "mista", teacher: "Prof. Ana", duration: "40 min", progress: 100, status: "concluída" },
  { id: "2", title: "Ditado - Palavras com LH e NH", subject: "Português", date: "26/02/2026", type: "caderno", teacher: "Prof. Ana", duration: "30 min", progress: 100, status: "concluída" },
];

export const MOCK_ENTRIES: NotebookEntry[] = [
  { 
    id: "1", student_id: "user1", date: "27/02/2026", subject: "Português", title: "Texto Narrativo", 
    content: "Aprendemos sobre texto narrativo.", 
    photo_url: null, status: "corrigido", grade: "Muito Bem!", 
    teacher_note: "Excelente!", lesson_id: "1" 
  }
];
