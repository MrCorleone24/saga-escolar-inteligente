import { motion } from "framer-motion";
import { Trophy, Flame, Star, Zap, Target, Award } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "flame" | "star" | "zap" | "target" | "award";
  earned: boolean;
  gradient: string;
}

const iconMap = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
};

const achievements: Achievement[] = [
  { id: "1", name: "Primeiro Passo", description: "Complete sua primeira aula", icon: "star", earned: true, gradient: "gradient-gamification" },
  { id: "2", name: "Dedicação", description: "7 dias seguidos de estudo", icon: "flame", earned: true, gradient: "gradient-badge" },
  { id: "3", name: "Nota Máxima", description: "Tire 10 em uma prova", icon: "trophy", earned: true, gradient: "gradient-success" },
  { id: "4", name: "Velocista", description: "Complete 5 atividades em 1 dia", icon: "zap", earned: false, gradient: "gradient-hero" },
  { id: "5", name: "Mira Certeira", description: "Acerte 100% de um quiz", icon: "target", earned: false, gradient: "gradient-gamification" },
  { id: "6", name: "Excelência", description: "Média acima de 9 no trimestre", icon: "award", earned: false, gradient: "gradient-badge" },
];

export default function AchievementGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {achievements.map((a, i) => {
        const Icon = iconMap[a.icon];
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex flex-col items-center gap-1.5 group"
            title={`${a.name}: ${a.description}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                ${a.earned ? a.gradient + " shadow-md" : "bg-muted"}`}
            >
              <Icon size={20} className={a.earned ? "text-primary-foreground" : "text-muted-foreground"} />
            </div>
            <span className={`text-[10px] font-medium text-center leading-tight ${a.earned ? "text-foreground" : "text-muted-foreground"}`}>
              {a.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
