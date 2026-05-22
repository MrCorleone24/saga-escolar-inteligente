import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Brain, Calendar, LayoutGrid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonCard from "./LessonCard";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

interface Lesson {
  id: string; 
  title: string; 
  subject: string; 
  type: string; 
  time: string; 
  day: number; 
  bncc?: string;
}


interface WeeklyPlanGridProps {
  grade: number;
  onCreateLesson?: (day: number) => void;
  onGenerateAI?: () => void;
}

export default function WeeklyPlanGrid({ grade, onCreateLesson, onGenerateAI }: WeeklyPlanGridProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      
      // Fetch subjects to map IDs to names
      const { data: subjectsData } = await supabase.from('subjects').select('id, name');
      const subjectMap = (subjectsData || []).reduce((acc: any, s: any) => {
        acc[s.id] = s.name;
        return acc;
      }, {});

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('grade_level', `${grade}º Ano`); 
      
      if (!error && data) {
        setLessons(data.map(l => ({
          id: l.id,
          title: l.title,
          subject: subjectMap[l.subject_id] || 'Geral',
          type: l.content_type || 'mista',
          time: l.start_time || '07:30',
          day: l.day_of_week || 0,
          bncc: l.bncc_code
        })));
      }
      setLoading(false);
    };
    fetchLessons();
  }, [grade]);



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
          <p className="text-xs text-muted-foreground">{SUBJECTS.length} disciplinas · {lessons.length} aulas planejadas</p>
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
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
                <p className="text-[10px] text-muted-foreground">Dia Útil</p>
              </div>
              <div className="space-y-2">
                {lessons.filter(l => l.day === dayIndex).map(lesson => (
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
      )}

    </div>
  );
}
