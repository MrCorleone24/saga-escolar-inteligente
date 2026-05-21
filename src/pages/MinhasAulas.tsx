import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Clock, CheckCircle2, Play, PenLine, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBJECTS, LessonLink } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  "concluída": "bg-secondary/10 text-secondary",
  "em andamento": "bg-primary/10 text-primary",
  "pendente": "bg-muted text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  interativa: "🖥️ Interativa",
  caderno: "📓 Caderno",
  mista: "📝 Mista",
  video: "🎬 Vídeo",
};

export default function MinhasAulas() {
  const navigate = useNavigate();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons', activeSubject],
    queryFn: async () => {
      let query = supabase.from('lessons').select('*, subjects(*)');
      if (activeSubject) {
        // First get the subject id
        const { data: subj } = await supabase.from('subjects').select('id').eq('name', activeSubject).single();
        if (subj) query = query.eq('subject_id', subj.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      return (data as any[]).map(l => ({
        ...l,
        subject: l.subjects?.name || "Desconhecido",
        teacher: "Prof. Responsável",
        progress: 0 // Progress calculation would need another table
      })) as LessonLink[];
    }
  });

  return (
    <DashboardLayout role="aluno" userName="Aluno" xp={0} level={1}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>
        <p className="text-muted-foreground text-sm">Acompanhe suas aulas e conteúdos por disciplina</p>
      </motion.div>

      {/* Subject filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubject(null)}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${!activeSubject ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}
        >
          Todas
        </button>
        {SUBJECTS.map(s => (
          <button
            key={s.name}
            onClick={() => setActiveSubject(s.name)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${
              activeSubject === s.name ? "text-primary-foreground shadow-md" : "bg-card text-muted-foreground border-border hover:border-primary/30"
            }`}
            style={activeSubject === s.name ? { backgroundColor: `hsl(${s.color})`, borderColor: `hsl(${s.color})` } : {}}
          >
            <span>{s.emoji}</span> {s.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {lessons.map((aula, i) => (
          <motion.div
            key={aula.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-sm">{aula.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[aula.status]}`}>{aula.status}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabels[aula.type]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{aula.subject} · {aula.date}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{aula.duration}</span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <Button size="sm" onClick={() => navigate(`/aula/${aula.id}`)}>
                  <Play size={14} className="mr-1" /> {aula.status === "pendente" ? "Iniciar" : "Continuar"}
                </Button>
                {aula.type === "caderno" && (
                  <Button size="sm" variant="outline" onClick={() => navigate("/meu-caderno")}>
                    <PenLine size={12} /> Caderno
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {lessons.length === 0 && !isLoading && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Nenhuma aula encontrada para esta disciplina.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
