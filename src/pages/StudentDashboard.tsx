import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AchievementGrid from "@/components/AchievementGrid";
import { BookOpen, Trophy, Flame, Target, Star, TrendingUp } from "lucide-react";

const upcomingTasks = [
  { subject: "Matemática", title: "Equações do 2º grau", due: "Hoje", color: "bg-primary" },
  { subject: "Português", title: "Redação dissertativa", due: "Amanhã", color: "bg-secondary" },
  { subject: "Ciências", title: "Relatório de laboratório", due: "Sexta", color: "bg-gamification-streak" },
  { subject: "História", title: "Linha do tempo – Era Vargas", due: "Próxima semana", color: "bg-gamification-badge" },
];

const subjects = [
  { name: "Matemática", progress: 72, grade: 8.5 },
  { name: "Português", progress: 85, grade: 9.0 },
  { name: "Ciências", progress: 60, grade: 7.5 },
  { name: "História", progress: 90, grade: 9.5 },
  { name: "Geografia", progress: 45, grade: 6.8 },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout role="aluno" userName="Lucas Silva" xp={73} level={12}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">Olá, Lucas! 👋</h1>
        <p className="text-muted-foreground text-sm">Continue estudando para manter sua sequência!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="XP Total" value="1.230" icon={<Star size={20} />} gradient="gamification" delay={0} subtitle="+45 hoje" />
        <StatCard title="Sequência" value="12 dias" icon={<Flame size={20} />} gradient="badge" delay={0.05} subtitle="Recorde: 15 dias" />
        <StatCard title="Medalhas" value="8" icon={<Trophy size={20} />} gradient="success" delay={0.1} subtitle="3 esta semana" />
        <StatCard title="Média Geral" value="8.3" icon={<TrendingUp size={20} />} gradient="hero" delay={0.15} subtitle="↑ 0.5 no mês" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Progresso por Disciplina
            </h2>
            <div className="space-y-4">
              {subjects.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">Nota: <strong className="text-foreground">{s.grade}</strong></span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-hero"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-gamification-gold" />
              Conquistas
            </h2>
            <AchievementGrid />
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Level card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="gradient-hero rounded-xl p-5 text-primary-foreground"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
                12
              </div>
              <div>
                <p className="font-bold text-lg">Nível 12</p>
                <p className="text-primary-foreground/70 text-xs">Explorador do Conhecimento</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-primary-foreground/70">
                <span>73 / 100 XP</span>
                <span>Nível 13</span>
              </div>
              <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-foreground/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "73%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Upcoming tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Target size={18} className="text-gamification-streak" />
              Próximas Tarefas
            </h2>
            <div className="space-y-3">
              {upcomingTasks.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-1.5 h-8 rounded-full ${t.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{t.due}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-gamification-gold" />
              Ranking da Turma
            </h2>
            <div className="space-y-2">
              {[
                { name: "Ana Costa", xp: 1480, pos: 1 },
                { name: "Lucas Silva", xp: 1230, pos: 2, isYou: true },
                { name: "Pedro Santos", xp: 1150, pos: 3 },
                { name: "Maria Oliveira", xp: 980, pos: 4 },
              ].map(r => (
                <div
                  key={r.pos}
                  className={`flex items-center gap-3 p-2 rounded-lg text-sm ${r.isYou ? "bg-primary/10 border border-primary/20" : ""}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${r.pos === 1 ? "gradient-gamification text-accent-foreground" : "bg-muted text-muted-foreground"}
                  `}>
                    {r.pos}
                  </span>
                  <span className="flex-1 font-medium">{r.name} {r.isYou && <span className="text-primary text-xs">(você)</span>}</span>
                  <span className="text-muted-foreground text-xs">{r.xp} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
