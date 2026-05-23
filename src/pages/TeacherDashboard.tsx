import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, Brain, ClipboardList, BarChart3, Calendar, Plus, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user: profile, loading: profileLoading } = useCurrentUser();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacherStats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', profile.id);
      const { data: classesData } = await supabase.from('rooms').select('*').eq('created_by', profile.id);
      
      const { data: performance } = await supabase.from('performance_reports').select('grade').eq('teacher_id', profile.id);
      const avgGrade = performance?.length ? (performance.reduce((acc, curr) => acc + Number(curr.grade), 0) / performance.length).toFixed(1) : "0.0";

      return {
        students: studentsCount || 0,
        lessons: lessonsCount || 0,
        classesCount: classesData?.length || 0,
        avgGrade
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

  if (profileLoading || statsLoading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bem-vinda, {profile?.full_name?.split(' ')[0] || "Profª"}!</h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas turmas e planeje com IA</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground font-bold shadow-md" onClick={() => navigate('/planejamento')}>
          <Plus size={16} className="mr-1.5" /> Novo Plano com IA
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Alunos" value={stats?.students.toString() || "0"} icon={<Users size={20} />} gradient="hero" subtitle={`${stats?.classesCount || 0} turmas`} />
        <StatCard title="Aulas Planejadas" value={stats?.lessons.toString() || "0"} icon={<Calendar size={20} />} gradient="success" subtitle="Total" />
        <StatCard title="Média Geral" value={stats?.avgGrade || "0.0"} icon={<TrendingUp size={20} />} gradient="gamification" subtitle="Média turmas" />
        <StatCard title="IA Sugestões" value="12" icon={<Brain size={20} />} gradient="badge" subtitle="Novas dicas" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Minhas Turmas
            </h2>
            <div className="space-y-3">
              {stats?.classesCount && stats.classesCount > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start h-16 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all" onClick={() => navigate('/turmas')}>
                    <div className="text-left">
                      <p className="font-bold text-sm">Ver todas as turmas</p>
                      <p className="text-xs text-muted-foreground">{stats.classesCount} turmas gerenciadas</p>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4 italic">Você ainda não criou nenhuma turma.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/turmas')}>Criar Primeira Turma</Button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-secondary" />
              Planejamentos Recentes
            </h2>
            <div className="space-y-2">
              {recentLessons.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border" onClick={() => navigate(`/planejamento`)}>
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-secondary/10 text-secondary`}>
                    Publicado
                  </span>
                </div>
              ))}
              {recentLessons.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center italic">Nenhum planejamento recente.</p>}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-hero rounded-xl p-6 text-primary-foreground shadow-lg">
            <Brain className="w-10 h-10 mb-4 opacity-90" />
            <h3 className="font-bold text-xl mb-2">Agente IA Pedagógico</h3>
            <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">Gere planos de aula, exercícios e avaliações alinhados à BNCC em segundos com nossa inteligência artificial.</p>
            <Button variant="secondary" className="w-full font-bold shadow-md" onClick={() => navigate('/ia-pedagogica')}>
              Abrir Agente IA
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-gamification-streak" />
              Engajamento Crítico
            </h2>
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground italic">Monitoramento automático ativado.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              Resumo Semanal
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Aulas dadas</span><span className="font-bold">12</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Atividades criadas</span><span className="font-bold">8</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Relatórios gerados</span><span className="font-bold">5</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
