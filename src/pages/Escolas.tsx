import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, Plus, Loader2, Edit2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";

interface SchoolProfile {
  id: string;
  school_name: string;
  email: string;
  max_students: number;
  max_teachers: number;
  subscription_status: string;
}

export default function Escolas() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState<SchoolProfile | null>(null);
  const { user: userProfile, loading: profileLoading } = useCurrentUser();
  const [stats, setStats] = useState({
    schoolsCount: 0,
    studentsCount: 0,
    teachersCount: 0,
  });
  const [formLimits, setFormLimits] = useState({ max_students: 0, max_teachers: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    const { data: schoolsData, error: schoolsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "school");

    if (schoolsError) {
      toast.error("Erro ao carregar escolas");
    } else {
      setSchools(schoolsData as SchoolProfile[]);
      
      const { count: studentsCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "student");
      const { count: teachersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "teacher");

      setStats({
        schoolsCount: schoolsData.length,
        studentsCount: studentsCount || 0,
        teachersCount: teachersCount || 0
      });
    }
    setLoading(false);
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;

    if (formLimits.max_students < 0 || formLimits.max_teachers < 0) {
      toast.error("Os limites não podem ser valores negativos.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          max_students: formLimits.max_students,
          max_teachers: formLimits.max_teachers
        })
        .eq("id", editingSchool.id);

      if (error) throw error;

      toast.success(`Limites da escola ${editingSchool.school_name} atualizados!`);
      setEditingSchool(null);
      fetchSchools();
    } catch (error: any) {
      console.error("Update limits error:", error);
      toast.error("Erro ao salvar novos limites. Verifique sua permissão.");
    } finally {
      setSubmitting(false);
    }
  };


  const startEdit = (school: SchoolProfile) => {
    setEditingSchool(school);
    setFormLimits({
      max_students: school.max_students || 0,
      max_teachers: school.max_teachers || 0
    });
  };

  if (profileLoading) return <DashboardLayout><div className="p-8"><Loader2 className="animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Escolas</h1>
          <p className="text-muted-foreground text-sm">Controle de limites e assinaturas das instituições</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground font-bold" onClick={() => navigate("/usuarios?role=school")}>
          <Plus size={16} className="mr-1.5" /> Nova Escola
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Escolas" value={stats.schoolsCount.toString()} icon={<School size={20} />} gradient="hero" subtitle="Na rede" />
        <StatCard title="Total Alunos" value={stats.studentsCount.toString()} icon={<Users size={20} />} gradient="success" />
        <StatCard title="Total Professores" value={stats.teachersCount.toString()} icon={<GraduationCap size={20} />} gradient="gamification" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 font-bold text-sm">Instituição</th>
                <th className="p-4 font-bold text-sm">E-mail</th>
                <th className="p-4 font-bold text-sm text-center">Alunos (Limite)</th>
                <th className="p-4 font-bold text-sm text-center">Profs (Limite)</th>
                <th className="p-4 font-bold text-sm text-center">Assinatura</th>
                <th className="p-4 font-bold text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">Nenhuma escola cadastrada no sistema.</td>
                </tr>
              ) : schools.map((school) => (
                <tr key={school.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {school.school_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-sm">{school.school_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{school.email}</td>
                  <td className="p-4 text-center font-bold text-secondary">{school.max_students || 0}</td>
                  <td className="p-4 text-center font-bold text-primary">{school.max_teachers || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      school.subscription_status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {school.subscription_status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(school)} className="hover:text-primary">
                      <Edit2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <h3 className="text-lg font-bold">Editar Limites: {editingSchool.school_name}</h3>
                <button onClick={() => setEditingSchool(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateLimits} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Limite Máximo de Alunos</label>
                  <Input type="number" value={formLimits.max_students} onChange={e => setFormLimits({...formLimits, max_students: parseInt(e.target.value)})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Limite Máximo de Professores</label>
                  <Input type="number" value={formLimits.max_teachers} onChange={e => setFormLimits({...formLimits, max_teachers: parseInt(e.target.value)})} className="h-11" />
                </div>
                <Button type="submit" className="w-full gradient-hero h-12 font-bold shadow-lg" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />} Salvar Configurações
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
