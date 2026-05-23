import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AchievementGrid from "@/components/AchievementGrid";
import { BookOpen, Trophy, Star, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function StudentDashboard() {
  const { user: profile, loading: profileLoading } = useCurrentUser();

  const { data: lessonsCount = 0 } = useQuery({
    queryKey: ['lessonsCount'],
    queryFn: async () => {
      const { count, error } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  if (profileLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout 
      xp={profile?.xp || 0} 
      level={profile?.level || 1}
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Olá, {profile?.full_name?.split(' ')[0] || "Aluno"}! 👋</h1>
        <p className="text-muted-foreground text-sm">Continue estudando para manter sua sequência!</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="XP Total" value={profile?.xp?.toString() || "0"} icon={<Star size={20} />} gradient="gamification" delay={0} subtitle="Progresso acumulado" />
        <StatCard title="Aulas" value={lessonsCount.toString()} icon={<BookOpen size={20} />} gradient="badge" delay={0.05} subtitle="Conteúdo disponível" />
        <StatCard title="Medalhas" value="0" icon={<Trophy size={20} />} gradient="success" delay={0.1} subtitle="Conquistas" />
        <StatCard title="Nível" value={profile?.level?.toString() || "1"} icon={<TrendingUp size={20} />} gradient="hero" delay={0.15} subtitle="Evolução" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-primary" />
              Minhas Conquistas
            </h2>
            <div className="py-8 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Sistema de conquistas em desenvolvimento.</p>
              <p className="text-xs text-muted-foreground mt-1">Complete aulas para ganhar XP em breve!</p>
            </div>
            <div className="mt-6 opacity-40 grayscale pointer-events-none">
              <AchievementGrid />
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-hero rounded-xl p-6 text-primary-foreground shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-3xl font-bold border border-primary-foreground/10">
                {profile?.level || 1}
              </div>
              <div>
                <p className="font-bold text-xl">Nível {profile?.level || 1}</p>
                <p className="text-primary-foreground/70 text-xs">Próximo: Nível {(profile?.level || 1) + 1}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-primary-foreground">
                <span>{(profile?.xp || 0) % 100} / 100 XP</span>
                <span>{100 - ((profile?.xp || 0) % 100)} XP restantes</span>
              </div>
              <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden border border-primary-foreground/10">
                <motion.div
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Star size={18} className="text-gamification-gold" />
              Ranking da Semana
            </h2>
            <div className="py-4 text-center">
              <p className="text-xs text-muted-foreground italic">O ranking será atualizado no final de semana.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
