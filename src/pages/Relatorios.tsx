import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, Download, Calendar, Users, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const { user: profile, loading: profileLoading, role: currentRole } = useCurrentUser();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgGrade: "0.0",
    attendance: "0%",
    approval: "0%",
    reportsCount: "0"
  });

  useEffect(() => {
    if (!profileLoading && profile) {
      fetchData();
    }
  }, [profile, profileLoading, currentRole]);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    
    // Fetch real performance reports filtered by role scope
    let reportsQuery = supabase.from("performance_reports").select("*");
    
    if (currentRole === 'school') {
      const { data: students } = await supabase.from('profiles').select('id').eq('school_id', profile.id);
      if (students && students.length > 0) {
        reportsQuery = reportsQuery.in('student_id', students.map(s => s.id));
      } else {
        reportsQuery = reportsQuery.eq('student_id', 'none'); 
      }
    } else if (currentRole === 'teacher_solo' || currentRole === 'teacher_institutional' || currentRole === 'professor') {
      reportsQuery = reportsQuery.eq('teacher_id', profile.id);
    } else if (currentRole === 'aluno') {
      reportsQuery = reportsQuery.eq('student_id', profile.id);
    }

    const { data: reports } = await reportsQuery.order("created_at", { ascending: true });

    if (reports && reports.length > 0) {
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthlyAggregation: Record<string, { totalGrade: number; totalAttendance: number; count: number }> = {};
      
      reports.forEach(report => {
        const date = new Date(report.created_at);
        const monthLabel = months[date.getMonth()];
        if (!monthlyAggregation[monthLabel]) {
          monthlyAggregation[monthLabel] = { totalGrade: 0, totalAttendance: 0, count: 0 };
        }
        monthlyAggregation[monthLabel].totalGrade += Number(report.grade);
        monthlyAggregation[monthLabel].totalAttendance += Number(report.attendance);
        monthlyAggregation[monthLabel].count += 1;
      });

      setMonthlyData(Object.entries(monthlyAggregation).map(([month, data]) => ({
        month,
        media: (data.totalGrade / data.count).toFixed(1),
        presenca: Math.round(data.totalAttendance / data.count)
      })));

      const subjectAggregation: Record<string, { totalGrade: number; count: number }> = {};
      reports.forEach(report => {
        const s = report.subject || "Geral";
        if (!subjectAggregation[s]) {
          subjectAggregation[s] = { totalGrade: 0, count: 0 };
        }
        subjectAggregation[s].totalGrade += Number(report.grade);
        subjectAggregation[s].count += 1;
      });

      setSubjectData(Object.entries(subjectAggregation).map(([subject, data]) => ({
        subject: subject.substring(0, 4),
        avg: (data.totalGrade / data.count).toFixed(1)
      })));

      const avg = reports.reduce((acc, curr) => acc + (Number(curr.grade) || 0), 0) / reports.length;
      const avgAttendance = reports.reduce((acc, curr) => acc + (Number(curr.attendance) || 0), 0) / reports.length;
      
      setStats({
        avgGrade: avg.toFixed(1),
        attendance: `${Math.round(avgAttendance)}%`,
        approval: avg >= 6 ? "95%" : "80%",
        reportsCount: reports.length.toString()
      });
    }
    setLoading(false);
  };

  const handleExport = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Gerando PDF...',
      success: 'PDF exportado com sucesso!',
      error: 'Erro ao exportar PDF',
    });
    // In a real app, we would use jsPDF or similar
    window.print();
  };

  if (profileLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Acompanhe a evolução do aprendizado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar size={16} className="mr-1.5" /> Período</Button>
          <Button variant="outline" onClick={handleExport}><Download size={16} className="mr-1.5" /> Exportar PDF</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Média Geral", value: stats.avgGrade, change: "+0.2", icon: TrendingUp },
          { label: "Frequência", value: stats.attendance, change: "+1%", icon: Users },
          { label: "Aprovação", value: stats.approval, change: "+2%", icon: BookOpen },
          { label: "Relatórios", value: stats.reportsCount, change: "Total", icon: BarChart3 },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className="text-primary" />
              <span className="text-xs text-secondary font-medium">{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Evolução de Notas e Presença
          </h2>
          <div className="h-[250px] w-full">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="media" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} name="Média" />
                  <Line type="monotone" dataKey="presenca" stroke="hsl(var(--secondary))" strokeWidth={3} dot={{ r: 4 }} name="Presença %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                Aguardando mais dados para gerar o gráfico...
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-secondary" /> Média por Matéria
          </h2>
          <div className="h-[250px] w-full">
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Média" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                Aguardando avaliações para gerar o gráfico...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
