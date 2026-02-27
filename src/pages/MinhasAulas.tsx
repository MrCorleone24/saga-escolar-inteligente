import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Clock, CheckCircle2, Play, PenLine, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBJECTS, MOCK_LESSONS } from "@/lib/subjects";

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

  const filtered = activeSubject
    ? MOCK_LESSONS.filter(l => l.subject === activeSubject)
    : MOCK_LESSONS;

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
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
          Todas ({MOCK_LESSONS.length})
        </button>
        {SUBJECTS.map(s => {
          const count = MOCK_LESSONS.filter(l => l.subject === s.name).length;
          if (count === 0) return null;
          return (
            <button
              key={s.name}
              onClick={() => setActiveSubject(s.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 transition-all ${
                activeSubject === s.name ? "text-primary-foreground shadow-md" : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
              style={activeSubject === s.name ? { backgroundColor: `hsl(${s.color})`, borderColor: `hsl(${s.color})` } : {}}
            >
              <span>{s.emoji}</span> {s.name} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filtered.map((aula, i) => {
          const subjectData = SUBJECTS.find(s => s.name === aula.subject);
          return (
            <motion.div
              key={aula.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ backgroundColor: subjectData ? `hsl(${subjectData.color} / 0.15)` : undefined }}>
                  {subjectData?.emoji || "📖"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-sm">{aula.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[aula.status]}`}>{aula.status}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabels[aula.type]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{aula.subject} · {aula.teacher} · {aula.date}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{aula.duration}</span>
                  </div>
                  {aula.progress > 0 && aula.progress < 100 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full gradient-hero" initial={{ width: 0 }} animate={{ width: `${aula.progress}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.03 }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{aula.progress}% concluído</p>
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex flex-col gap-2">
                  {aula.status === "concluída" ? (
                    <div className="flex items-center gap-1.5 text-secondary">
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-medium">Concluída</span>
                    </div>
                  ) : (
                    <Button size="sm" className="gradient-hero border-0 text-primary-foreground" onClick={() => navigate(`/aula/${aula.id}`)}>
                      <Play size={14} className="mr-1" />
                      {aula.status === "pendente" ? "Iniciar" : "Continuar"}
                    </Button>
                  )}
                  {(aula.type === "caderno" || aula.type === "mista") && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate("/meu-caderno")}>
                      <PenLine size={12} /> Caderno
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
