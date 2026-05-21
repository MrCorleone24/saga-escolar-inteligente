import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserPlus, Search, Shield, GraduationCap, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  school_name: string;
  subscription_status: string;
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newSchool, setNewSchool] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);

      let query = supabase.from("profiles").select("*");
      
      // Hierarchy filtering
      if (profile.role === 'school') {
        query = query.eq('school_id', profile.id);
      } else if (profile.role === 'teacher') {
        query = query.eq('teacher_id', profile.id).eq('role', 'student');
      }

      const { data, error } = await query;
      if (!error) setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: {
          email: newEmail,
          password: newPassword,
          fullName: newName,
          role: newRole,
          schoolName: newSchool || currentUser?.school_name,
          subject: newSubject
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Usuário criado com sucesso!");
      setShowAddModal(false);
      fetchData();
      
      // Reset form
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewSchool("");
      setNewSubject("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleIcons: Record<string, React.ElementType> = {
    teacher: GraduationCap,
    student: BookOpen,
    admin: Shield,
    school: Shield,
  };

  const roleLabels: Record<string, string> = {
    teacher: "Professor",
    student: "Aluno",
    admin: "Administrador",
    school: "Escola",
  };

  const roleColors: Record<string, string> = {
    teacher: "bg-primary/10 text-primary",
    student: "bg-secondary/10 text-secondary",
    admin: "bg-gamification-badge/10 text-gamification-badge",
    school: "bg-orange-500/10 text-orange-600",
  };

  return (
    <DashboardLayout role={currentUser?.role || "admin"} userName={currentUser?.full_name || "Admin"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerencie {currentUser?.role === 'admin' ? 'todos os' : 'seus'} usuários</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gradient-hero border-0 text-primary-foreground">
          <UserPlus size={16} className="mr-1.5" /> Novo Usuário
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-3 mb-6 flex items-center gap-3">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou escola..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">Nenhum usuário encontrado.</p>
            ) : (
              filteredUsers.map((u, i) => {
                const RoleIcon = roleIcons[u.role] || Users;
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {u.full_name?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.full_name || 'Usuário Sem Nome'}</p>
                        <p className="text-xs text-muted-foreground">{u.email} {u.school_name && `· ${u.school_name}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${roleColors[u.role]}`}>
                        <RoleIcon size={10} /> {roleLabels[u.role]}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.subscription_status === "active" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                      }`}>
                        {u.subscription_status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold">Novo Usuário</h3>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: João Silva" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@exemplo.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Senha Temporária</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="No mínimo 6 caracteres" required minLength={6} />
                </div>
                
                {currentUser?.role === 'admin' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Usuário</label>
                    <select 
                      value={newRole} 
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="school">Escola</option>
                      <option value="teacher">Professor</option>
                      <option value="student">Aluno</option>
                    </select>
                  </div>
                )}

                {currentUser?.role === 'school' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de Usuário</label>
                    <select 
                      value={newRole} 
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="teacher">Professor</option>
                      <option value="student">Aluno</option>
                    </select>
                  </div>
                )}

                {newRole === 'teacher' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Matéria</label>
                    <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Ex: Matemática" required />
                  </div>
                )}

                {(currentUser?.role === 'admin' || currentUser?.role === 'school') && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome da Escola (Opcional)</label>
                    <Input value={newSchool} onChange={e => setNewSchool(e.target.value)} placeholder="Nome da instituição" />
                  </div>
                )}

                <Button type="submit" className="w-full gradient-hero py-6 font-bold" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : "Criar Usuário"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

