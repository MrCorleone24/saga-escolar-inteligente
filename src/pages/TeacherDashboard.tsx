import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, Brain, ClipboardList, BarChart3, Calendar, Plus, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['teacherStats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { data: classesData } = await supabase.from('rooms').select('*').eq('created_by', profile.id);
      
      return {
        students: studentsCount || 0,
        lessons: lessonsCount || 0,
        classesCount: classesData?.length || 0
      };
    },
    enabled: !!profile?.id
  });

  const { data: recentLessons = [] } = useQuery({
    queryKey: ['recentLessons', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('lessons').select('*').eq('teacher_id', profile?.id).order('created_at', { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!profile?.id
  });

  return (
    <DashboardLayout role="professor" userName={profile?.full_name || "Professora"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bem-vinda, {profile?.full_name?.split(' ')[0] || "Profª"}!</h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas turmas e planeje com IA</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <Plus size={16} className="mr-1.5" /> Novo Plano com IA
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Alunos" value={stats?.students.toString() || "0"} icon={<Users size={20} />} gradient="hero" subtitle={`${stats?.classesCount || 0} turmas`} />
        <StatCard title="Aulas Planejadas" value={stats?.lessons.toString() || "0"} icon={<Calendar size={20} />} gradient="success" subtitle="Total" />
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
              {/* To be implemented: Fetch real rooms and student counts */}
              <p className="text-xs text-muted-foreground py-4 text-center italic">Gerencie suas turmas na seção de Turmas.</p>
            </div>
          </motion.div>

          {/* Recent plans */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-secondary" />
              Planejamentos Recentes
            </h2>
            <div className="space-y-2">
              {recentLessons.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-secondary/10 text-secondary`}>
                    Publicado
                  </span>
                </div>
              ))}
              {recentLessons.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum planejamento encontrado.</p>}
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
              Alunos com Baixo Engajamento
            </h2>
            <div className="space-y-3 text-center py-4">
              <p className="text-xs text-muted-foreground italic">Monitoramento em tempo real baseado em XP e atividades.</p>
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
