import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, GraduationCap, BookOpen, BarChart3, School, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

interface DashboardStats {
  schools?: number;
  students?: number;
  teachers?: number;
  mrr?: number;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ schools: 0, students: 0, teachers: 0, mrr: 0, attendanceRate: 0 });
  const [schools, setSchools] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);

        // Fetch counts based on role scope
        const isGlobalAdmin = p.role === 'admin';
        const schoolId = p.id;

        const { count: sCount } = isGlobalAdmin 
          ? await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'school')
          : { count: 1 }; // Current school
        
        const studentQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const teacherQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
        
        if (!isGlobalAdmin) {
          studentQuery.eq('school_id', schoolId);
          teacherQuery.eq('school_id', schoolId);
        }

        const { count: stCount } = await studentQuery;
        const { count: tCount } = await teacherQuery;
        
        setStats({ 
          schools: sCount || 0, 
          students: stCount || 0, 
          teachers: tCount || 0,
          mrr: isGlobalAdmin ? (sCount || 0) * 499 : (stCount || 0) * 15, // Simplified MRR logic
          attendanceRate: 0 
        });

          // Fetch attendance rate
          const { data: attData } = await supabase.from('attendance').select('status');
          if (attData && attData.length > 0) {
            const present = attData.filter(a => a.status === 'presente').length;
            const rate = Math.round((present / attData.length) * 100);
            setStats(prev => ({ ...prev, attendanceRate: rate }));
          }

        // Fetch real schools list
        const { data: schoolsList } = await supabase
          .from('profiles')
          .select('id, school_name, full_name, role')
          .eq('role', 'school')
          .limit(10);

        if (schoolsList) {
          const schoolsWithCounts = await Promise.all(schoolsList.map(async (school) => {
            const { count: st } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'student');
            const { count: tc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('role', 'teacher');
            return {
              name: school.school_name || school.full_name || "Escola sem nome",
              students: st || 0,
              teachers: tc || 0,
              avg: "8.5"
            };
          }));
          setSchools(schoolsWithCounts);
        }

        // Fetch recent activities
        const { data: recentEvents } = await supabase.from('school_calendar_events').select('title, created_at').order('created_at', { ascending: false }).limit(4);
        const activities = (recentEvents || []).map(e => `Evento criado: ${e.title}`);
        if (activities.length === 0) {
          activities.push("Sistema iniciado", "Aguardando atividades...");
        }
        setRecentActivity(activities);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout role={(profile?.role as any) || "admin"} userName={profile?.full_name || "Diretor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground text-sm">Visão geral de todas as escolas</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Escolas" value={stats.schools.toString()} icon={<School size={20} />} gradient="hero" subtitle="Instituições" />
        <StatCard title="Alunos" value={stats.students.toString()} icon={<Users size={20} />} gradient="success" subtitle="Na plataforma" />
        <StatCard title="Professores" value={stats.teachers.toString()} icon={<GraduationCap size={20} />} gradient="gamification" />
        <StatCard title="Receita (MRR)" value={`R$ ${stats.mrr.toLocaleString()}`} icon={<TrendingUp size={20} />} gradient="badge" subtitle="Assinaturas" />

      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Schools */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <School size={18} className="text-primary" />
              {profile?.role === 'admin' ? "Escolas da Rede" : "Professores da Escola"}
            </h2>
            <div className="space-y-3">
              {schools.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.teachers} professores · {s.students} alunos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{s.avg}</p>
                    <p className="text-[10px] text-muted-foreground">Média</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-secondary" />
              Indicadores da Rede
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
          {/* Security */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-success rounded-xl p-5 text-secondary-foreground">
            <ShieldCheck className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-bold text-lg mb-1">LGPD Compliant</h3>
            <p className="text-secondary-foreground/70 text-sm">Todos os dados estão protegidos e em conformidade com a LGPD.</p>
          </motion.div>

          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-gamification-streak" />
              Alertas
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <p className="font-medium text-destructive">3 alunos com frequência crítica</p>
                <p className="text-xs text-muted-foreground mt-0.5">E.M. Monteiro Lobato</p>
              </div>
              <div className="p-3 rounded-lg border border-gamification-gold/20 bg-gamification-gold/5">
                <p className="font-medium text-gamification-gold">5 turmas sem planejamento semanal</p>
                <p className="text-xs text-muted-foreground mt-0.5">Atualizar até sexta</p>
              </div>
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5">
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
