import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { ClipboardList, Brain, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import WeeklyPlanGrid from "@/components/planejamento/WeeklyPlanGrid";
import LessonPlanForm from "@/components/planejamento/LessonPlanForm";

export default function Planejamento() {
  const [grade, setGrade] = useState(3);
  const [view, setView] = useState<"grid" | "create">("grid");

  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-primary" size={24} /> Planejamento Semanal
          </h1>
          <p className="text-muted-foreground text-sm">Organize todas as aulas da semana por disciplina</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {[1,2,3,4,5,6,7].map(g => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${grade === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {g}º
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
          onSave={() => setView("grid")}
        />
      )}
    </DashboardLayout>
  );
}
