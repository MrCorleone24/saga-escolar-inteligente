import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, TrendingUp, UserPlus, BarChart3, Loader2, Plus, X, Award, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  trend: string;
}

export default function Turmas() {
  const queryClient = useQueryClient();
  const { user: currentUser, loading: userLoading, role: currentRole } = useCurrentUser();
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Create class form
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassPeriod, setNewClassPeriod] = useState("Diurno");
  const [newClassSchoolId, setNewClassSchoolId] = useState("");

  // Performance form
  const [grade, setGrade] = useState("");
  const [attendance, setAttendance] = useState("");
  const [engagement, setEngagement] = useState(80);
  const [aiFeedback, setAiFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: schools = [] } = useQuery({
    queryKey: ['schools-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, school_name').eq('role', 'school');
      if (error) return [];
      return data;
    },
    enabled: currentRole === 'admin'
  });

  const { data: turmasList = [], isLoading: turmasLoading } = useQuery({
    queryKey: ['turmas', currentUser?.id, currentRole],
    queryFn: async () => {
      if (!currentUser) return [];
      
      let query = supabase.from("subjects").select("*");
      
      if (currentRole === 'admin') {
        // Admin sees all
      } else if (currentRole === 'school') {
        // In a real system, we'd have a subjects_schools junction or similar
        // For now, let's assume we can filter assignments
        const { data: assignments } = await supabase.from('teacher_assignments').select('subject_id').eq('school_id', currentUser.id);
        if (assignments && assignments.length > 0) {
          query = query.in('id', assignments.map(a => a.subject_id));
        }
      } else if (currentRole === 'teacher') {
        const { data: assignments } = await supabase.from('teacher_assignments').select('subject_id').eq('teacher_id', currentUser.id);
        if (assignments && assignments.length > 0) {
          query = query.in('id', assignments.map(a => a.subject_id));
        } else {
          return [];
        }
      }
      
      const { data, error } = await query;
      if (error) return [];
      
      return data.map((s: any) => ({
        id: s.id,
        name: s.name,
        subject: s.name,
        period: "Diurno",
        student_count: 0
      }));
    },
    enabled: !!currentUser
  });

  const { data: studentsList = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students-turma', selectedTurma],
    queryFn: async () => {
      if (!selectedTurma || !currentUser) return [];
      
      let query = supabase.from("profiles").select("*").eq("role", "student");
      
      if (currentRole === 'teacher') {
        query = query.eq('teacher_id', currentUser.id);
      } else if (currentRole === 'school') {
        query = query.eq('school_id', currentUser.id);
      }
      
      const { data: studentsData, error } = await query;
      if (error || !studentsData) return [];

      const studentIds = studentsData.map(s => s.id);
      const { data: perfData } = await supabase
        .from('performance_reports')
        .select('student_id, grade, attendance')
        .in('student_id', studentIds);

      return studentsData.map(s => {
        const studentPerf = perfData?.filter(p => p.student_id === s.id) || [];
        const avgG = studentPerf.length > 0 
          ? studentPerf.reduce((acc, curr) => acc + Number(curr.grade), 0) / studentPerf.length 
          : 0;
        const avgA = studentPerf.length > 0 
          ? studentPerf.reduce((acc, curr) => acc + Number(curr.attendance), 0) / studentPerf.length 
          : 0;

        return {
          id: s.id,
          full_name: s.full_name || "Estudante",
          attendance: Math.round(avgA) || 0,
          avg_grade: Number(avgG.toFixed(1)),
          trend: 'stable'
        };
      });
    },
    enabled: !!selectedTurma && !!currentUser
  });

  const handleCreateTurma = async () => {
    if (!newClassName.trim()) {
      toast.error("Por favor, informe o nome da turma.");
      return;
    }

    if (currentRole === 'admin' && !newClassSchoolId) {
      toast.error("Por favor, selecione uma escola para esta turma.");
      return;
    }

    setSubmitting(true);
    try {
      // Use subjects table - it has name, color, emoji
      const { data: subjectData, error: subjectError } = await supabase.from('subjects').insert({
        name: newClassName.trim(),
        color: "#4f46e5",
        emoji: "📚"
      }).select().single();

      if (subjectError) {
        console.error("Subject insert error:", subjectError);
        throw new Error("Não foi possível criar a disciplina base da turma.");
      }

      // Create assignment if school is selected or if current user is school/teacher
      const targetSchoolId = currentRole === 'admin' ? newClassSchoolId : (currentRole === 'school' ? currentUser.id : currentUser?.school_id);
      
      const { error: assignError } = await supabase.from('teacher_assignments').insert({
        school_id: targetSchoolId || null,
        teacher_id: currentRole === 'teacher' ? currentUser.id : null,
        subject_id: subjectData.id,
        grade_level: "Ensino Fundamental"
      });

      if (assignError) {
        console.error("Assignment error:", assignError);
        // We don't throw here to avoid user confusion if the subject was created but assignment failed
        toast.warning("Turma criada, mas houve um problema no vínculo administrativo.");
      }
      
      toast.success("Turma criada com sucesso!");
      setShowCreateModal(false);
      setNewClassName("");
      setNewClassSchoolId("");
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    } catch (error: any) {
      console.error("Create turma error:", error);
      toast.error(error.message || "Ocorreu um erro ao criar a turma.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedTurma) return;
    
    // Validation
    const gradeNum = Number(grade);
    const attendanceNum = Number(attendance);

    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
      toast.error("A nota deve ser um valor entre 0 e 10.");
      return;
    }

    if (isNaN(attendanceNum) || attendanceNum < 0 || attendanceNum > 100) {
      toast.error("A presença deve ser um valor entre 0 e 100%.");
      return;
    }

    setSubmitting(true);
    const turma = turmasList.find(t => t.id === selectedTurma);
    
    try {
      const { error } = await supabase.from('performance_reports').insert({
        student_id: selectedStudent.id,
        teacher_id: currentUser?.id || "",
        subject: turma?.name || "Geral",
        grade: gradeNum,
        attendance: attendanceNum,
        engagement_score: engagement,
        ai_feedback: aiFeedback
      });

      if (error) throw error;
      
      toast.success(`Desempenho de ${selectedStudent.full_name.split(' ')[0]} registrado!`);
      setShowEntryModal(false);
      setGrade("");
      setAttendance("");
      setAiFeedback("");
      queryClient.invalidateQueries({ queryKey: ['students-turma', selectedTurma] });
    } catch (error: any) {
      console.error("Record performance error:", error);
      toast.error("Não foi possível salvar os dados de desempenho.");
    } finally {
      setSubmitting(false);
    }
  };


  if (userLoading || turmasLoading) {
    return (
      <DashboardLayout role="professor" userName="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={(currentRole as any) || "professor"} userName={currentUser?.full_name || "Professor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Turmas</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas turmas e alunos</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="gradient-hero border-0 text-primary-foreground">
              <UserPlus size={16} className="mr-1.5" /> Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Turma</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Nome da Turma</Label>
                <Input id="className" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Ex: 9º Ano A" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Período</Label>
                <Select value={newClassPeriod} onValueChange={setNewClassPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matutino">Matutino</SelectItem>
                    <SelectItem value="Vespertino">Vespertino</SelectItem>
                    <SelectItem value="Noturno">Noturno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {currentRole === 'admin' && (
                <div className="grid gap-2">
                  <Label htmlFor="school">Escola</Label>
                  <Select value={newClassSchoolId} onValueChange={setNewClassSchoolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.school_name || s.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateTurma} disabled={submitting} className="bg-primary text-white">
                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Criar Turma"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Turmas" value={turmasList.length.toString()} icon={<Users size={20} />} gradient="hero" subtitle="Ativas" />
        <StatCard title="Total Alunos" value={studentsList.length.toString()} icon={<Users size={20} />} gradient="success" />
        <StatCard title="Média Geral" value={studentsList.length > 0 ? (studentsList.reduce((acc, s) => acc + s.avg_grade, 0) / studentsList.length).toFixed(1) : "--"} icon={<TrendingUp size={20} />} gradient="gamification" />
        <StatCard title="Presença" value={studentsList.length > 0 ? `${Math.round(studentsList.reduce((acc, s) => acc + s.attendance, 0) / studentsList.length)}%` : "--"} icon={<BarChart3 size={20} />} gradient="badge" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                  onClick={() => setSelectedTurma(t.id)}
                >
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.subject} · {t.period}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">{(t as any).avg_grade || '--'}</p>
                      <p className="text-[10px] text-muted-foreground">Média</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {turmasList.length === 0 && !turmasLoading && (
                <p className="text-center py-10 text-muted-foreground text-sm">Nenhuma turma vinculada.</p>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border border-border p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-secondary" /> Alunos {selectedTurma && `- ${turmasList.find(t => t.id === selectedTurma)?.name}`}
            </h2>
            {studentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {studentsList.map((s, i) => (
                  <div 
                    key={s.id} 
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowEntryModal(true);
                    }}
                  >
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                      </Button>
                      <span className="text-sm font-bold">{s.avg_grade > 0 ? s.avg_grade : '--'}</span>
                      <TrendingUp size={12} className={s.trend === "up" ? "text-secondary" : s.trend === "down" ? "text-destructive" : "text-muted-foreground"} />
                    </div>
                  </div>
                ))}
                {studentsList.length === 0 && (
                  <p className="text-center py-10 text-muted-foreground text-xs">Selecione uma turma ou cadastre alunos.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showEntryModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Award className="text-primary" size={20} />
                  <h3 className="text-lg font-bold">Lançar Performance</h3>
                </div>
                <button onClick={() => setShowEntryModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRecordPerformance} className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-bold">
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedStudent.full_name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {turmasList.find(t => t.id === selectedTurma)?.name}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Nota (0-10)</label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="10" 
                      value={grade} 
                      onChange={e => setGrade(e.target.value)} 
                      placeholder="Ex: 8.5" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Frequência (%)</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={attendance} 
                      onChange={e => setAttendance(e.target.value)} 
                      placeholder="Ex: 100" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block flex justify-between">
                    Engajamento <span>{engagement}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={engagement} 
                    onChange={e => setEngagement(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                    <Brain size={12} className="text-primary" /> Feedback / Observações
                  </label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={aiFeedback}
                    onChange={e => setAiFeedback(e.target.value)}
                    placeholder="Observações sobre o desempenho do aluno..."
                  />
                </div>

                <Button type="submit" className="w-full gradient-hero py-6 font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : "Salvar Registro"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
