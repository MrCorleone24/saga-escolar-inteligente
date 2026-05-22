import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { ClipboardList, Brain, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeeklyPlanGrid from "@/components/planejamento/WeeklyPlanGrid";
import LessonPlanForm from "@/components/planejamento/LessonPlanForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Planejamento() {
  const [grade, setGrade] = useState(3);
  const [view, setView] = useState<"grid" | "create">("grid");
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <DashboardLayout role={(user?.role as any) || "professor"} userName="Carregando...">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={(user?.role as any) || "professor"} userName={user?.full_name || "Professor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-primary" size={24} /> Planejamento Semanal
          </h1>
          <p className="text-muted-foreground text-sm">Organize todas as aulas da semana por disciplina</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {["1º","2º","3º","4º","5º","6º","7º","8º","9º","1º EM","2º EM","3º EM"].map(g => (
              <button
                key={g}
                onClick={() => setGrade(parseInt(g) || 1)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${grade === (parseInt(g) || 1) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {view === "grid" ? (
        <WeeklyPlanGrid
          grade={grade}
          onCreateLesson={() => setView("create")}
          onGenerateAI={() => {}}
        />
      ) : (
        <LessonPlanForm
          grade={grade}
          onClose={() => setView("grid")}
          onSave={async (formData) => {
            const { error } = await supabase
              .from('lessons')
              .insert({
                title: formData.title,
                subject_id: (await supabase.from('subjects').select('id').eq('name', formData.subject).single()).data?.id,
                teacher_id: user?.id,
                grade_level: formData.grade, // Pass directly since it now includes EM/EF labels
                day_of_week: 0, // Need to pass day from grid
                bncc_code: formData.bncc,
                start_time: "07:30",
                content_type: formData.type,
                content: formData.content,
                duration: formData.duration,
                status: 'planejada'
              } as any);
            
            if (error) {
              toast.error("Erro ao salvar aula");
            } else {
              toast.success("Aula planejada com sucesso!");
              setView("grid");
            }
          }}
        />

      )}
    </DashboardLayout>
  );
}
