import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, TrendingUp, UserPlus, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const turmas = [
  { name: "9º Ano A", students: 32, avg: 7.8, attendance: 92, subject: "Matemática", period: "Manhã" },
  { name: "9º Ano B", students: 30, avg: 8.2, attendance: 88, subject: "Matemática", period: "Manhã" },
  { name: "8º Ano A", students: 28, avg: 7.5, attendance: 95, subject: "Matemática", period: "Tarde" },
  { name: "7º Ano C", students: 35, avg: 8.0, attendance: 91, subject: "Matemática", period: "Manhã" },
];

const students = [
  { name: "Ana Costa", grade: 9.2, attendance: 98, trend: "up" },
  { name: "Lucas Silva", grade: 8.5, attendance: 95, trend: "up" },
  { name: "Pedro Santos", grade: 7.0, attendance: 88, trend: "down" },
  { name: "Maria Oliveira", grade: 6.5, attendance: 72, trend: "down" },
  { name: "João Mendes", grade: 8.8, attendance: 96, trend: "stable" },
];

export default function Turmas() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Turmas</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas turmas e alunos</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <UserPlus size={16} className="mr-1.5" /> Nova Turma
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Turmas" value="4" icon={<Users size={20} />} gradient="hero" subtitle="Ativas" />
        <StatCard title="Total Alunos" value="125" icon={<Users size={20} />} gradient="success" />
        <StatCard title="Média Geral" value="7.9" icon={<TrendingUp size={20} />} gradient="gamification" subtitle="↑ 0.3" />
        <StatCard title="Presença" value="91%" icon={<BarChart3 size={20} />} gradient="badge" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Classes list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Turmas
            </h2>
            <div className="space-y-3">
              {turmas.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.subject} · {t.period} · {t.students} alunos</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">{t.avg}</p>
                      <p className="text-[10px] text-muted-foreground">Média</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{t.attendance}%</p>
                      <p className="text-[10px] text-muted-foreground">Presença</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: student list of selected class */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-secondary" /> Alunos - 9º Ano A
            </h2>
            <div className="space-y-2">
              {students.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.attendance}% presença</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{s.grade}</span>
                    <TrendingUp size={12} className={s.trend === "up" ? "text-secondary" : s.trend === "down" ? "text-destructive" : "text-muted-foreground"} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
