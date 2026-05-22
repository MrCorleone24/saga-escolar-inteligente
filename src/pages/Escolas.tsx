import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, TrendingUp, Plus, MapPin, Loader2, Edit2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

interface SchoolProfile {
  id: string;
  school_name: string;
  email: string;
  max_students: number;
  max_teachers: number;
  subscription_status: string;
}

export default function Escolas() {
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState<SchoolProfile | null>(null);
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
      
      // Fetch stats
      const { count: studentsCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "student");
      const { count: teachersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "teacher");
      
      setStats({
        schoolsCount: schoolsData.length,
        studentsCount: studentsCount || 0,
        teachersCount: teachersCount || 0,
      });
    }
    setLoading(false);
  };

  const handleUpdateLimits = async () => {
    if (!editingSchool) return;
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          max_students: formLimits.max_students,
          max_teachers: formLimits.max_teachers
        })
        .eq('id', editingSchool.id);

      if (error) throw error;
      
      toast.success("Limites atualizados com sucesso");
      setEditingSchool(null);
      fetchSchools();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
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

  return (
    <DashboardLayout role={(userProfile?.role as any) || "admin"} userName={userProfile?.full_name || "Administrador"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Escolas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as escolas da rede</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground" onClick={() => toast.info("Use a aba Usuários para cadastrar novas Escolas")}>
          <Plus size={16} className="mr-1.5" /> Nova Escola
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Escolas" value={stats.schoolsCount.toString()} icon={<School size={20} />} gradient="hero" subtitle="Na rede" />
        <StatCard title="Total Alunos" value={stats.studentsCount.toString()} icon={<Users size={20} />} gradient="success" />
        <StatCard title="Total Professores" value={stats.teachersCount.toString()} icon={<GraduationCap size={20} />} gradient="gamification" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
          <div className="space-y-3">
            {schools.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">Nenhuma escola cadastrada.</p>
            ) : (
              schools.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                      <School className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.school_name || "Sem nome definido"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={10} /> {s.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Limite: {s.max_teachers} professores · {s.max_students} alunos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      s.subscription_status === "active" ? "bg-secondary/10 text-secondary" : "bg-gamification-gold/10 text-gamification-gold"
                    }`}>
                      {s.subscription_status === 'active' ? 'Ativa' : 'Pendente'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}>
                      <Edit2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {editingSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold">Editar Limites</h3>
                <button onClick={() => setEditingSchool(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg mb-4">
                  <p className="text-sm font-bold">{editingSchool.school_name}</p>
                  <p className="text-xs text-muted-foreground">{editingSchool.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Máximo de Alunos</label>
                  <Input 
                    type="number" 
                    value={formLimits.max_students} 
                    onChange={e => setFormLimits({...formLimits, max_students: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Máximo de Professores</label>
                  <Input 
                    type="number" 
                    value={formLimits.max_teachers} 
                    onChange={e => setFormLimits({...formLimits, max_teachers: parseInt(e.target.value)})}
                  />
                </div>

                <Button className="w-full gradient-hero py-6 font-bold" onClick={handleUpdateLimits} disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <><Save className="mr-2" size={18} /> Salvar Alterações</>}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

