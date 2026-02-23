import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, Brain, ClipboardList, BarChart3, Calendar, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const classes = [
  { name: "9º Ano A", students: 32, avg: 7.8, attendance: 92 },
  { name: "9º Ano B", students: 30, avg: 8.2, attendance: 88 },
  { name: "8º Ano A", students: 28, avg: 7.5, attendance: 95 },
];

const recentPlans = [
  { title: "Equações do 2º Grau", subject: "Matemática", date: "Hoje", status: "IA Gerado" },
  { title: "Romantismo Brasileiro", subject: "Português", date: "Ontem", status: "Publicado" },
  { title: "Ciclo da Água", subject: "Ciências", date: "Seg", status: "Rascunho" },
];

const atRiskStudents = [
  { name: "João Mendes", risk: "Alto", reason: "Frequência baixa (68%)", class: "9º Ano A" },
  { name: "Carla Lima", risk: "Médio", reason: "Notas em queda", class: "9º Ano B" },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bem-vinda, Profª Maria!</h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas turmas e planeje com IA</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <Plus size={16} className="mr-1.5" /> Novo Plano com IA
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Alunos" value="90" icon={<Users size={20} />} gradient="hero" subtitle="3 turmas" />
        <StatCard title="Aulas Planejadas" value="24" icon={<Calendar size={20} />} gradient="success" subtitle="Este mês" />
        <StatCard title="Média Geral" value="7.8" icon={<TrendingUp size={20} />} gradient="gamification" subtitle="↑ 0.3" />
        <StatCard title="IA Sugestões" value="12" icon={<Brain size={20} />} gradient="badge" subtitle="Novas" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Classes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Minhas Turmas
            </h2>
            <div className="space-y-3">
              {classes.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.students} alunos</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">{c.avg}</p>
                      <p className="text-[10px] text-muted-foreground">Média</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{c.attendance}%</p>
                      <p className="text-[10px] text-muted-foreground">Presença</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent plans */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-secondary" />
              Planejamentos Recentes
            </h2>
            <div className="space-y-2">
              {recentPlans.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.subject} · {p.date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${p.status === "IA Gerado" ? "bg-gamification-badge/10 text-gamification-badge" :
                      p.status === "Publicado" ? "bg-secondary/10 text-secondary" :
                      "bg-muted text-muted-foreground"}
                  `}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-hero rounded-xl p-5 text-primary-foreground">
            <Brain className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">Agente IA Pedagógico</h3>
            <p className="text-primary-foreground/70 text-sm mb-4">Gere planos de aula, exercícios e avaliações alinhados à BNCC em segundos.</p>
            <Button variant="secondary" size="sm" className="font-semibold">
              Abrir Agente IA
            </Button>
          </motion.div>

          {/* At Risk */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-gamification-streak" />
              Alunos em Risco
            </h2>
            <div className="space-y-3">
              {atRiskStudents.map((s, i) => (
                <div key={i} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${s.risk === "Alto" ? "bg-destructive/10 text-destructive" : "bg-gamification-gold/10 text-gamification-gold"}`}>
                      {s.risk}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.class}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Resumo Semanal
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Aulas dadas</span><strong>12</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Atividades criadas</span><strong>8</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Provas aplicadas</span><strong>3</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Relatórios gerados</span><strong>5</strong></div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
