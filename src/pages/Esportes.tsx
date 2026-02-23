import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Dumbbell, Timer, Target, TrendingUp, Calendar, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const sports = [
  { name: "Futebol", emoji: "⚽", selected: true },
  { name: "Basquete", emoji: "🏀", selected: false },
  { name: "Vôlei", emoji: "🏐", selected: false },
  { name: "Natação", emoji: "🏊", selected: false },
  { name: "Atletismo", emoji: "🏃", selected: false },
  { name: "Judô", emoji: "🥋", selected: false },
];

const weekPlan = [
  { day: "Segunda", activity: "Treino tático", duration: "60 min", done: true },
  { day: "Terça", activity: "Condicionamento", duration: "45 min", done: true },
  { day: "Quarta", activity: "Descanso ativo", duration: "30 min", done: false },
  { day: "Quinta", activity: "Treino técnico", duration: "60 min", done: false },
  { day: "Sexta", activity: "Jogo coletivo", duration: "90 min", done: false },
];

export default function Esportes() {
  return (
    <DashboardLayout role="aluno" userName="Lucas Silva" xp={73} level={12}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Módulo Esportes</h1>
        <p className="text-muted-foreground text-sm">Seu plano de treino e evolução esportiva</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Treinos" value="24" icon={<Dumbbell size={20} />} gradient="hero" subtitle="Este mês" />
        <StatCard title="Horas" value="18h" icon={<Timer size={20} />} gradient="success" subtitle="Treinadas" />
        <StatCard title="Metas" value="5/8" icon={<Target size={20} />} gradient="gamification" subtitle="Cumpridas" />
        <StatCard title="Evolução" value="+15%" icon={<TrendingUp size={20} />} gradient="badge" subtitle="No mês" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sport selection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Dumbbell size={18} className="text-primary" /> Meu Esporte
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {sports.map(s => (
                <button
                  key={s.name}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    s.selected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl block mb-1">{s.emoji}</span>
                  <span className="text-xs font-medium">{s.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Weekly plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-secondary" /> Plano Semanal
            </h2>
            <div className="space-y-2">
              {weekPlan.map((d, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${d.done ? "border-secondary/30 bg-secondary/5" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${d.done ? "bg-secondary" : "bg-muted"}`} />
                    <div>
                      <p className="text-sm font-medium">{d.day}</p>
                      <p className="text-xs text-muted-foreground">{d.activity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{d.duration}</span>
                    {d.done && <span className="text-xs text-secondary font-medium">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Current goal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-gamification rounded-xl p-5 text-accent-foreground">
            <Flame className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">Meta Atual</h3>
            <p className="text-accent-foreground/70 text-sm mb-3">Completar 30 treinos este mês</p>
            <div className="h-2 bg-accent-foreground/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent-foreground/90 rounded-full" style={{ width: "80%" }} />
            </div>
            <p className="text-xs mt-2 text-accent-foreground/70">24/30 treinos</p>
          </motion.div>

          {/* Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Desempenho
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Velocidade</span><strong>8.5/10</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Resistência</span><strong>7.2/10</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Técnica</span><strong>9.0/10</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tático</span><strong>7.8/10</strong></div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
