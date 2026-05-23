import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import AchievementGrid from "@/components/AchievementGrid";
import { BookOpen, Trophy, Flame, Target, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function StudentDashboard() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: lessonsCount = 0 } = useQuery({
    queryKey: ['lessonsCount'],
    queryFn: async () => {
      const { count, error } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: achievementsCount = 0 } = useQuery({
    queryKey: ['achievementsCount', userId],
    queryFn: async () => {
      if (!userId) return 0;
      // We don't have achievements_users table yet, so we return 0 for now
      // or check if it exists in the schema. For production, we should ensure it's there.
      return 0;
    },
    enabled: !!userId
  });

  return (
    <DashboardLayout 
      role="aluno" 
      userName={profile?.full_name || "Aluno"} 
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
        <StatCard title="Medalhas" value={achievementsCount.toString()} icon={<Trophy size={20} />} gradient="success" delay={0.1} subtitle="Conquistas" />
        <StatCard title="Nível" value={profile?.level?.toString() || "1"} icon={<TrendingUp size={20} />} gradient="hero" delay={0.15} subtitle="Evolução" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Conquistas do Aluno
            </h2>
            <AchievementGrid />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-hero rounded-xl p-5 text-primary-foreground">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
                {profile?.level || 1}
              </div>
              <div>
                <p className="font-bold text-lg">Nível {profile?.level || 1}</p>
                <p className="text-primary-foreground/70 text-xs">Explorador do Conhecimento</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-primary-foreground/70">
                <span>{(profile?.xp || 0) % 100} / 100 XP</span>
                <span>Nível {(profile?.level || 1) + 1}</span>
              </div>
              <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-foreground/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(profile?.xp || 0) % 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
