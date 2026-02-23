import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Clock, CheckCircle2, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const aulas = [
  { subject: "Matemática", title: "Equações do 2º Grau", teacher: "Prof. Maria", progress: 75, status: "em andamento", duration: "45 min" },
  { subject: "Português", title: "Análise Sintática", teacher: "Prof. Ana", progress: 100, status: "concluída", duration: "40 min" },
  { subject: "Ciências", title: "Células e Tecidos", teacher: "Prof. Carlos", progress: 30, status: "em andamento", duration: "50 min" },
  { subject: "História", title: "Era Vargas", teacher: "Prof. João", progress: 0, status: "pendente", duration: "45 min" },
  { subject: "Geografia", title: "Biomas Brasileiros", teacher: "Prof. Lúcia", progress: 100, status: "concluída", duration: "40 min" },
  { subject: "Inglês", title: "Past Simple Tense", teacher: "Prof. Sarah", progress: 50, status: "em andamento", duration: "35 min" },
];

const statusColors: Record<string, string> = {
  "concluída": "bg-secondary/10 text-secondary",
  "em andamento": "bg-primary/10 text-primary",
  "pendente": "bg-muted text-muted-foreground",
};

export default function MinhasAulas() {
  return (
    <DashboardLayout role="aluno" userName="Lucas Silva" xp={73} level={12}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Minhas Aulas</h1>
        <p className="text-muted-foreground text-sm">Acompanhe suas aulas e conteúdos</p>
      </motion.div>

      <div className="grid gap-4">
        {aulas.map((aula, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm">{aula.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[aula.status]}`}>
                    {aula.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{aula.subject} · {aula.teacher}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{aula.duration}</span>
                </div>
                {aula.progress > 0 && aula.progress < 100 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full gradient-hero"
                        initial={{ width: 0 }}
                        animate={{ width: `${aula.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{aula.progress}% concluído</p>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {aula.status === "concluída" ? (
                  <div className="flex items-center gap-1.5 text-secondary">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">Concluída</span>
                  </div>
                ) : (
                  <Button size="sm" className="gradient-hero border-0 text-primary-foreground">
                    <Play size={14} className="mr-1" />
                    {aula.status === "pendente" ? "Iniciar" : "Continuar"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
