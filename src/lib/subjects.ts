export interface Subject {
  name: string;
  color: string;
  emoji: string;
}

export interface FeedbackVersion {
  id: string;
  date: string;
  grade: string;
  note: string;
  status: "corrigido" | "devolvido";
}

export interface NotebookEntry {
  id: number;
  date: string;
  subject: string;
  title: string;
  content: string;
  photo: string | null;
  status: "rascunho" | "enviado" | "corrigido" | "devolvido" | "pendente" | "confirmado";
  grade?: string;
  teacherNote?: string;
  lessonId?: string;
  lessonRef?: string;
  versions?: FeedbackVersion[];
  confirmedAt?: string;
}

export const SUBJECTS: Subject[] = [
  { name: "Português", color: "217 91% 50%", emoji: "📖" },
  { name: "Matemática", color: "152 60% 42%", emoji: "🔢" },
  { name: "Ciências", color: "280 65% 55%", emoji: "🔬" },
  { name: "História", color: "38 92% 55%", emoji: "🏛️" },
  { name: "Geografia", color: "170 60% 45%", emoji: "🌍" },
  { name: "Inglês", color: "0 84% 60%", emoji: "🇺🇸" },
  { name: "Espanhol", color: "25 95% 53%", emoji: "🇪🇸" },
  { name: "Filosofia", color: "260 50% 55%", emoji: "🤔" },
  { name: "Sociologia", color: "200 55% 50%", emoji: "👥" },
  { name: "Educação Física", color: "120 55% 45%", emoji: "⚽" },
  { name: "Tecnologia e IA", color: "210 80% 55%", emoji: "🤖" },
  { name: "Empreendedorismo", color: "45 90% 50%", emoji: "🚀" },
  { name: "Leitura/Literatura", color: "340 65% 50%", emoji: "📚" },
];

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

export const MOCK_LESSONS: LessonLink[] = [
  { id: "1", title: "Texto Narrativo - A Formiguinha e a Neve", subject: "Português", date: "27/02/2026", type: "mista", teacher: "Prof. Ana", duration: "40 min", progress: 100, status: "concluída" },
  { id: "2", title: "Ditado - Palavras com LH e NH", subject: "Português", date: "26/02/2026", type: "caderno", teacher: "Prof. Ana", duration: "30 min", progress: 100, status: "concluída" },
  { id: "3", title: "Análise Sintática", subject: "Português", date: "25/02/2026", type: "interativa", teacher: "Prof. Ana", duration: "40 min", progress: 100, status: "concluída" },
  { id: "4", title: "Tabuada do 3 e do 4", subject: "Matemática", date: "27/02/2026", type: "mista", teacher: "Prof. Maria", duration: "45 min", progress: 75, status: "em andamento" },
  { id: "5", title: "Problemas de Adição e Subtração", subject: "Matemática", date: "26/02/2026", type: "interativa", teacher: "Prof. Maria", duration: "45 min", progress: 100, status: "concluída" },
  { id: "6", title: "Equações do 2º Grau", subject: "Matemática", date: "24/02/2026", type: "interativa", teacher: "Prof. Maria", duration: "45 min", progress: 75, status: "em andamento" },
  { id: "7", title: "Células e Tecidos", subject: "Ciências", date: "27/02/2026", type: "video", teacher: "Prof. Carlos", duration: "50 min", progress: 30, status: "em andamento" },
  { id: "8", title: "Ciclo da Água - Desenho", subject: "Ciências", date: "25/02/2026", type: "caderno", teacher: "Prof. Carlos", duration: "40 min", progress: 100, status: "concluída" },
  { id: "9", title: "Os Povos Indígenas do Brasil", subject: "História", date: "24/02/2026", type: "mista", teacher: "Prof. João", duration: "45 min", progress: 50, status: "em andamento" },
  { id: "10", title: "Era Vargas", subject: "História", date: "23/02/2026", type: "interativa", teacher: "Prof. João", duration: "45 min", progress: 0, status: "pendente" },
  { id: "11", title: "Biomas Brasileiros", subject: "Geografia", date: "26/02/2026", type: "video", teacher: "Prof. Lúcia", duration: "40 min", progress: 100, status: "concluída" },
  { id: "12", title: "Past Simple Tense", subject: "Inglês", date: "27/02/2026", type: "interativa", teacher: "Prof. Sarah", duration: "35 min", progress: 50, status: "em andamento" },
  { id: "13", title: "Saludos y Presentaciones", subject: "Espanhol", date: "27/02/2026", type: "interativa", teacher: "Prof. Carmen", duration: "35 min", progress: 0, status: "pendente" },
  { id: "14", title: "O que é Filosofia?", subject: "Filosofia", date: "26/02/2026", type: "mista", teacher: "Prof. Ricardo", duration: "40 min", progress: 60, status: "em andamento" },
  { id: "15", title: "Convivência em Sociedade", subject: "Sociologia", date: "25/02/2026", type: "interativa", teacher: "Prof. Fernanda", duration: "40 min", progress: 100, status: "concluída" },
  { id: "16", title: "Jogos Cooperativos", subject: "Educação Física", date: "27/02/2026", type: "caderno", teacher: "Prof. Diego", duration: "50 min", progress: 0, status: "pendente" },
  { id: "17", title: "Introdução ao Pensamento Computacional", subject: "Tecnologia e IA", date: "26/02/2026", type: "interativa", teacher: "Prof. Tech", duration: "45 min", progress: 80, status: "em andamento" },
  { id: "18", title: "Minha Primeira Ideia de Negócio", subject: "Empreendedorismo", date: "25/02/2026", type: "mista", teacher: "Prof. Marcos", duration: "40 min", progress: 40, status: "em andamento" },
  { id: "19", title: "Leitura: O Pequeno Príncipe - Cap 1", subject: "Leitura/Literatura", date: "27/02/2026", type: "caderno", teacher: "Prof. Ana", duration: "30 min", progress: 100, status: "concluída" },
  { id: "20", title: "Leitura: O Pequeno Príncipe - Cap 2", subject: "Leitura/Literatura", date: "26/02/2026", type: "caderno", teacher: "Prof. Ana", duration: "30 min", progress: 50, status: "em andamento" },
];
