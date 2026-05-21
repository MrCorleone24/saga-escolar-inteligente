import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, TrendingUp, UserPlus, Search, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Turma {
  id: string;
  name: string;
  subject: string;
  period: string;
  student_count?: number;
  avg_grade?: number;
}

interface Student {
  id: string;
  full_name: string;
  attendance: number;
  avg_grade: number;
  trend: 'up' | 'down' | 'stable';
}

export default function Turmas() {
  const [loading, setLoading] = useState(true);
  const [turmasList, setTurmasList] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);

      // Fetch groups/subjects as "Turmas"
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*");
      
      const filteredSubjects = subjectsData?.filter(s => 
        profile.role === 'teacher' ? (s as any).teacher_id === user.id : (s as any).school_id === user.id
      );
      
      if (filteredSubjects) {
        setTurmasList(filteredSubjects.map(s => ({
          id: s.id,
          name: s.name,
          subject: s.name,
          period: "Diurno",
          student_count: 0
        })));
      }
    }
    setLoading(false);
  };

  const fetchStudents = async (turmaId: string) => {
    setSelectedTurma(turmaId);
    // Fetch students linked to this teacher/school
    const { data: studentsData } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .eq(currentUser.role === 'teacher' ? 'teacher_id' : 'school_id', currentUser.id);
    
    if (studentsData) {
      setStudentsList(studentsData.map(s => ({
        id: s.id,
        full_name: s.full_name || "Estudante",
        attendance: 90, // Mock for now until attendance table is ready
        avg_grade: 0,
        trend: 'stable'
      })));
    }
  };

  return (
    <DashboardLayout role={currentUser?.role || "professor"} userName={currentUser?.full_name || "Professor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Turmas</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas turmas e alunos</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <UserPlus size={16} className="mr-1.5" /> Nova Turma
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Turmas" value={turmasList.length.toString()} icon={<Users size={20} />} gradient="hero" subtitle="Ativas" />
        <StatCard title="Total Alunos" value={studentsList.length.toString()} icon={<Users size={20} />} gradient="success" />
        <StatCard title="Média Geral" value="--" icon={<TrendingUp size={20} />} gradient="gamification" />
        <StatCard title="Presença" value="--" icon={<BarChart3 size={20} />} gradient="badge" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Classes list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Turmas
            </h2>
            <div className="space-y-3">
              {turmasList.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedTurma === t.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                  }`}
                  onClick={() => fetchStudents(t.id)}
                >
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.subject} · {t.period}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">{t.avg_grade || '--'}</p>
                      <p className="text-[10px] text-muted-foreground">Média</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {turmasList.length === 0 && !loading && (
                <p className="text-center py-10 text-muted-foreground text-sm">Nenhuma turma vinculada.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: student list of selected class */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-secondary" /> Alunos {selectedTurma && `- ${turmasList.find(t => t.id === selectedTurma)?.name}`}
            </h2>
            <div className="space-y-2">
              {studentsList.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {s.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.full_name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.attendance}% presença</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{s.avg_grade > 0 ? s.avg_grade : '--'}</span>
                    <TrendingUp size={12} className={s.trend === "up" ? "text-secondary" : s.trend === "down" ? "text-destructive" : "text-muted-foreground"} />
                  </div>
                </div>
              ))}
              {studentsList.length === 0 && (
                <p className="text-center py-10 text-muted-foreground text-xs">Selecione uma turma ou cadastre alunos.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
