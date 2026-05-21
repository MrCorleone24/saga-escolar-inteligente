import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Brain, Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonCard from "./LessonCard";
import { SUBJECTS } from "@/lib/subjects";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];


interface Lesson {
  id: string; title: string; subject: string; type: string; time: string; day: number; bncc?: string;
}

const MOCK_LESSONS: Lesson[] = [
  { id: "1", title: "Leitura e Interpretação de Texto", subject: "Português", type: "mista", time: "07:30", day: 0, bncc: "EF03LP01" },
  { id: "2", title: "Adição e Subtração com Reagrupamento", subject: "Matemática", type: "interativa", time: "08:30", day: 0, bncc: "EF03MA05" },
  { id: "3", title: "O Ciclo da Água", subject: "Ciências", type: "video", time: "09:30", day: 0, bncc: "EF03CI07" },
  { id: "4", title: "Produção de Texto Narrativo", subject: "Português", type: "caderno", time: "07:30", day: 1, bncc: "EF03LP21" },
  { id: "5", title: "Multiplicação por 2, 3 e 4", subject: "Matemática", type: "interativa", time: "08:30", day: 1, bncc: "EF03MA03" },
  { id: "6", title: "Os Primeiros Habitantes do Brasil", subject: "História", type: "mista", time: "09:30", day: 1, bncc: "EF03HI01" },
  { id: "7", title: "Regiões do Brasil", subject: "Geografia", type: "interativa", time: "07:30", day: 2, bncc: "EF03GE01" },
  { id: "8", title: "Cores e Formas - Pintura", subject: "Artes", type: "caderno", time: "08:30", day: 2 },
  { id: "9", title: "Greetings and Introductions", subject: "Inglês", type: "interativa", time: "09:30", day: 2 },
  { id: "10", title: "Ortografia: S, SS, Ç", subject: "Português", type: "mista", time: "07:30", day: 3, bncc: "EF03LP01" },
  { id: "11", title: "Problemas com Divisão", subject: "Matemática", type: "interativa", time: "08:30", day: 3, bncc: "EF03MA07" },
  { id: "12", title: "Jogos Cooperativos", subject: "Ed. Física", type: "caderno", time: "09:30", day: 3 },
  { id: "13", title: "Documentário: Animais Brasileiros", subject: "Ciências", type: "video", time: "07:30", day: 4, bncc: "EF03CI06" },
  { id: "14", title: "Revisão Semanal", subject: "Matemática", type: "interativa", time: "08:30", day: 4 },
  { id: "15", title: "Valores e Convivência", subject: "Ensino Religioso", type: "mista", time: "09:30", day: 4 },
];

interface WeeklyPlanGridProps {
  grade: number;
  onCreateLesson?: (day: number) => void;
  onGenerateAI?: () => void;
}

export default function WeeklyPlanGrid({ grade, onCreateLesson, onGenerateAI }: WeeklyPlanGridProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button 
            variant={viewMode === "day" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-3"
            onClick={() => setViewMode("day")}
          >
            Dia
          </Button>
          <Button 
            variant={viewMode === "week" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-3"
            onClick={() => setViewMode("week")}
          >
            Semana
          </Button>
          <Button 
            variant={viewMode === "month" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-3"
            onClick={() => setViewMode("month")}
          >
            Mês
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">{grade}º Ano — Semana 24/02 a 28/02</h3>
          <p className="text-xs text-muted-foreground">{SUBJECTS.length} disciplinas · {MOCK_LESSONS.length} aulas planejadas</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onCreateLesson?.(0)}>
            <Plus size={14} className="mr-1" /> Criar Aula
          </Button>
          <Button size="sm" className="gradient-badge border-0 text-primary-foreground" onClick={onGenerateAI}>
            <Brain size={14} className="mr-1" /> Gerar Semana com IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {DAYS.map((day, dayIndex) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className="space-y-2"
          >
            <div className="text-center py-2 rounded-lg bg-muted">
              <p className="text-xs font-bold">{day}</p>
              <p className="text-[10px] text-muted-foreground">{24 + dayIndex}/02</p>
            </div>
            <div className="space-y-2">
              {MOCK_LESSONS.filter(l => l.day === dayIndex).map(lesson => (
                <LessonCard key={lesson.id} {...lesson} />
              ))}
              <button
                onClick={() => onCreateLesson?.(dayIndex)}
                className="w-full p-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
