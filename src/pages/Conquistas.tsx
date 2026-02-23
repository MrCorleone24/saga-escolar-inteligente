import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Trophy, Star, Flame, Target, BookOpen, Zap, Medal, Crown } from "lucide-react";

const badges = [
  { name: "Primeiro Passo", desc: "Complete sua primeira aula", icon: Star, earned: true, date: "10/01", rarity: "Comum" },
  { name: "Sequência de Fogo", desc: "7 dias seguidos estudando", icon: Flame, earned: true, date: "18/01", rarity: "Raro" },
  { name: "Mente Brilhante", desc: "Nota 10 em uma prova", icon: Zap, earned: true, date: "25/01", rarity: "Épico" },
  { name: "Leitor Voraz", desc: "Leia 10 textos complementares", icon: BookOpen, earned: true, date: "02/02", rarity: "Raro" },
  { name: "Alvo Certeiro", desc: "100% em 5 exercícios seguidos", icon: Target, earned: true, date: "08/02", rarity: "Épico" },
  { name: "Maratonista", desc: "Complete 50 aulas", icon: Medal, earned: false, progress: 38, total: 50, rarity: "Lendário" },
  { name: "Campeão", desc: "Fique em 1º no ranking", icon: Crown, earned: false, progress: 0, total: 1, rarity: "Lendário" },
  { name: "Dedicação Total", desc: "30 dias seguidos", icon: Flame, earned: false, progress: 12, total: 30, rarity: "Épico" },
];

const rarityColors: Record<string, string> = {
  "Comum": "text-muted-foreground",
  "Raro": "text-primary",
  "Épico": "text-gamification-badge",
  "Lendário": "text-gamification-gold",
};

const rarityBg: Record<string, string> = {
  "Comum": "bg-muted",
  "Raro": "bg-primary/10",
  "Épico": "bg-gamification-badge/10",
  "Lendário": "bg-gamification-gold/10",
};

export default function Conquistas() {
  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <DashboardLayout role="aluno" userName="Lucas Silva" xp={73} level={12}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground text-sm">Suas medalhas e conquistas conquistadas</p>
      </motion.div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-gamification-gold" />
          <p className="text-2xl font-bold">{earned.length}</p>
          <p className="text-xs text-muted-foreground">Conquistadas</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border p-4 text-center">
          <Medal className="w-8 h-8 mx-auto mb-2 text-gamification-badge" />
          <p className="text-2xl font-bold">{locked.length}</p>
          <p className="text-xs text-muted-foreground">Bloqueadas</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-4 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">1.230</p>
          <p className="text-xs text-muted-foreground">XP Total</p>
        </motion.div>
      </div>

      {/* Earned */}
      <h2 className="font-bold text-base mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-gamification-gold" /> Conquistadas
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {earned.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl gradient-gamification flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold ${rarityColors[b.rarity]}`}>{b.rarity}</span>
                  <span className="text-[10px] text-muted-foreground">· {b.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Locked */}
      <h2 className="font-bold text-base mb-3 flex items-center gap-2">
        <Target size={18} className="text-muted-foreground" /> Em Progresso
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locked.map((b, i) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 opacity-70"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full gradient-hero" style={{ width: `${(b.progress! / b.total!) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{b.progress}/{b.total}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
