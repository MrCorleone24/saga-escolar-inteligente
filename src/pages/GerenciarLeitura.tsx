import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Plus, Users, CheckCircle2, Clock, XCircle, Eye, Flame, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const ASSIGNMENTS = [
  {
    id: 1, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry",
    pages: 96, class: "3º A", deadline: "15/03/2026",
    students: [
      { name: "João Silva", read: 64, checkIns: 8, streak: 5 },
      { name: "Maria Oliveira", read: 80, checkIns: 12, streak: 8 },
      { name: "Pedro Santos", read: 30, checkIns: 4, streak: 1 },
    ],
  },
  {
    id: 2, title: "A Bolsa Amarela", author: "Lygia Bojunga",
    pages: 136, class: "3º A", deadline: "30/03/2026",
    students: [
      { name: "João Silva", read: 20, checkIns: 3, streak: 2 },
      { name: "Maria Oliveira", read: 45, checkIns: 6, streak: 4 },
      { name: "Pedro Santos", read: 10, checkIns: 1, streak: 0 },
    ],
  },
];

export default function GerenciarLeitura() {
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" size={24} /> Gerenciar Leitura
          </h1>
          <p className="text-muted-foreground text-sm">Atribua livros e acompanhe os check-ins dos alunos</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} className="mr-1.5" /> Nova Leitura
        </Button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 mb-6 space-y-3">
          <h3 className="font-bold text-sm">Atribuir Nova Leitura</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Título do livro" />
            <Input placeholder="Autor" />
            <Input placeholder="Total de páginas" type="number" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option>3º A</option><option>3º B</option><option>4º A</option>
            </select>
            <Input type="date" />
          </div>
          <div className="flex gap-2">
            <Button className="gradient-hero border-0 text-primary-foreground">Atribuir</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Leituras Ativas", value: ASSIGNMENTS.length.toString(), icon: BookOpen, color: "text-primary" },
          { label: "Alunos Lendo", value: "8", icon: Users, color: "text-secondary" },
          { label: "Check-ins Hoje", value: "5", icon: CheckCircle2, color: "text-gamification-xp" },
          { label: "Maior Streak", value: "8 dias", icon: Flame, color: "text-gamification-streak" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Assignments */}
      <div className="space-y-4">
        {ASSIGNMENTS.map((a, i) => {
          const avgProgress = Math.round(a.students.reduce((sum, s) => sum + (s.read / a.pages) * 100, 0) / a.students.length);
          const isExpanded = expanded === a.id;

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button onClick={() => setExpanded(isExpanded ? null : a.id)} className="w-full text-left p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground">{a.author} · {a.pages} páginas · {a.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Prazo: {a.deadline}</p>
                    <p className="text-xs font-bold text-primary">Progresso médio: {avgProgress}%</p>
                  </div>
                </div>
                <Progress value={avgProgress} className="h-2 mt-3" />
              </button>

              {isExpanded && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
                  <div className="p-5 space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground">Progresso por Aluno</h4>
                    {a.students.map(s => {
                      const pct = Math.round((s.read / a.pages) * 100);
                      return (
                        <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                          <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xs">{s.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold">{s.name}</p>
                              <span className="text-[10px] text-muted-foreground">{s.read}/{a.pages} pág.</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="flex items-center gap-0.5"><CheckCircle2 size={10} className="text-secondary" /> {s.checkIns}</span>
                            <span className="flex items-center gap-0.5"><Flame size={10} className="text-gamification-streak" /> {s.streak}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
