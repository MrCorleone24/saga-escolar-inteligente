import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Users, GraduationCap, BookOpen, BarChart3, School, TrendingUp, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user: profile, loading: profileLoading, role: currentRole } = useCurrentUser();
  const [stats, setStats] = useState({ schools: 0, students: 0, teachers: 0, mrr: 0, attendanceRate: 0 });
  const [schools, setSchools] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      setLoading(true);
      
      const isGlobalAdmin = currentRole === 'admin';
      const schoolId = profile.id;

      // Fetch stats
      let studentCount = 0;
      let teacherCount = 0;
      let schoolCount = 0;

      if (isGlobalAdmin) {
        const { count: s } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'school');
        const { count: st } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
        schoolCount = s || 0;
        studentCount = st || 0;
        teacherCount = t || 0;
      } else {
        const { count: st } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('school_id', schoolId);
        const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('school_id', schoolId);
        schoolCount = 1;
        studentCount = st || 0;
        teacherCount = t || 0;
      }
      
      setStats({ 
        schools: schoolCount, 
        students: studentCount, 
        teachers: teacherCount,
        mrr: isGlobalAdmin ? schoolCount * 499 : studentCount * 15,
        attendanceRate: 0 
      });

      // Fetch attendance rate
      const { data: attData } = await supabase.from('attendance').select('status');
      if (attData && attData.length > 0) {
        const present = attData.filter(a => a.status === 'presente').length;
        const rate = Math.round((present / attData.length) * 100);
        setStats(prev => ({ ...prev, attendanceRate: rate }));
      }

      // Fetch list for the table
      const listQuery = supabase.from('profiles').select('id, school_name, full_name, role').limit(10);
      if (isGlobalAdmin) {
        listQuery.eq('role', 'school');
      } else {
        listQuery.eq('role', 'teacher').eq('school_id', schoolId);
      }

      const { data: listData } = await listQuery;
      if (listData) {
        const itemsWithCounts = await Promise.all(listData.map(async (item) => {
          if (isGlobalAdmin) {
            const { count: st } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', item.id).eq('role', 'student');
            const { count: tc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', item.id).eq('role', 'teacher');
            return {
              name: item.school_name || "Escola sem nome",
              students: st || 0,
              teachers: tc || 0,
              avg: "8.5"
            };
          } else {
            const { count: st } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('teacher_id', item.id).eq('role', 'student');
            return {
              name: item.full_name || "Professor",
              students: st || 0,
              teachers: 1,
              avg: "7.8"
            };
          }
        }));
        setSchools(itemsWithCounts);
      }

      // Activity
      const { data: recentEvents } = await supabase.from('school_calendar_events').select('title, created_at').order('created_at', { ascending: false }).limit(4);
      setRecentActivity((recentEvents || []).map(e => `Evento: ${e.title}`) || ["Sem atividades"]);

      setLoading(false);
    };

    if (!profileLoading) {
      fetchData();
    }
  }, [profile, profileLoading, currentRole]);

  if (profileLoading || loading) {
    return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></DashboardLayout>;
  }

  const isGlobalAdmin = currentRole === 'admin';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">{isGlobalAdmin ? "Painel Administrativo" : "Gestão Escolar"}</h1>
        <p className="text-muted-foreground text-sm">{isGlobalAdmin ? "Visão geral de todas as escolas" : "Visão geral da sua instituição"}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={isGlobalAdmin ? "Escolas" : "Instituição"} value={stats.schools.toString()} icon={<School size={20} />} gradient="hero" subtitle={isGlobalAdmin ? "Instituições" : "Ativa"} />
        <StatCard title="Alunos" value={stats.students.toString()} icon={<Users size={20} />} gradient="success" subtitle="Total" />
        <StatCard title="Professores" value={stats.teachers.toString()} icon={<GraduationCap size={20} />} gradient="gamification" />
        <StatCard title="Receita (MRR)" value={`R$ ${stats.mrr.toLocaleString()}`} icon={<TrendingUp size={20} />} gradient="badge" subtitle="Estimado" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <School size={18} className="text-primary" />
              {isGlobalAdmin ? "Escolas da Rede" : "Equipe Docente"}
            </h2>
            <div className="space-y-3">
              {schools.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.teachers} professores · {s.students} alunos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{s.avg}</p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                </div>
              ))}
              {schools.length === 0 && <p className="text-center py-4 text-muted-foreground text-sm">Nenhum dado encontrado.</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-secondary" />
              Indicadores de Desempenho
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Taxa de Aprovação", value: "91%", change: "Rede Geral" },
                { label: "Frequência Média", value: `${stats.attendanceRate}%`, change: "Tempo Real" },
                { label: "Evasão Escolar", value: "2.3%", change: "Estimado" },
                { label: "Satisfação", value: "4.2/5", change: "Feedback" },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                  <p className="text-xl font-bold">{m.value}</p>
                  <p className="text-xs text-secondary font-medium">{m.change}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-success rounded-xl p-5 text-secondary-foreground">
            <ShieldCheck className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">LGPD Compliant</h3>
            <p className="text-secondary-foreground/70 text-sm">Todos os dados estão protegidos e em conformidade com a LGPD.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-gamification-streak" />
              Alertas do Sistema
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <p className="font-medium text-destructive">Alunos com frequência baixa</p>
                <p className="text-xs text-muted-foreground mt-0.5">Verifique o relatório de faltas.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Atividade Recente
            </h2>
            <div className="space-y-3 text-sm">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="truncate">{a}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
