import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserPlus, Search, Shield, GraduationCap, BookOpen, X, Loader2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  school_name: string;
  subscription_status: string;
  subject?: string;
  school_id?: string;
  teacher_id?: string;
}

interface PerformanceData {
  grade: number;
  attendance: number;
  engagement: number;
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: currentUser, loading: profileLoading } = useCurrentUser();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({ grade: 0, attendance: 0, engagement: 0 });

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [teacherCategory, setTeacherCategory] = useState<"solo" | "institutional">("solo");
  const [newSchool, setNewSchool] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBio, setNewBio] = useState("");
  
  // Detailed fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [taxId, setTaxId] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  
  // Student specific
  const [gradeLevel, setGradeLevel] = useState("");
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [specialNeedsExpert, setSpecialNeedsExpert] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    if (currentUser) {
      let query = supabase.from("profiles").select("*");
      
      const role = currentUser.role?.toLowerCase();
      
      if (role === 'admin') {
      } else if (role === 'school') {
        query = query.eq('school_id', currentUser.id);
      } else if (role === 'teacher' || role === 'professor') {
        if (currentUser.school_id) {
          query = query.eq('school_id', currentUser.school_id).eq('role', 'student');
        } else {
          query = query.eq('teacher_id', currentUser.id).eq('role', 'student');
        }
      } else {
        query = query.eq('id', currentUser.id);
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
          schoolName: newSchool || (currentUser as any)?.school_name,
          subject: newSubject,
          phone,
          address,
          city,
          state,
          zipCode,
          taxId,
          website,
          contactPerson,
          bio: newBio,
          gradeLevel,
          hasSpecialNeeds,
          specialNeedsExpert,
          teacherId: teacherId || (currentUser?.role === 'teacher' ? currentUser.id : null),
          schoolId: schoolId || (currentUser?.role === 'school' ? currentUser.id : null),
          teacherCategory: teacherCategory
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
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setZipCode("");
      setTaxId("");
      setWebsite("");
      setContactPerson("");
      setNewBio("");
      setGradeLevel("");
      setHasSpecialNeeds(false);
      setSpecialNeedsExpert(false);
      setTeacherId("");
      setSchoolId("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserClick = async (user: any) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleShowPerformance = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    if (user.role === 'student' || user.role === 'aluno') {
      setSelectedUser(user);
      setShowPerformance(true);
      
      // Fetch real performance data from performance_reports table
      const { data, error } = await supabase
        .from("performance_reports")
        .select("grade, attendance, engagement_score")
        .eq("student_id", user.id);

      if (!error && data && data.length > 0) {
        const avgGrade = data.reduce((acc, curr) => acc + Number(curr.grade), 0) / data.length;
        const avgAttendance = data.reduce((acc, curr) => acc + Number(curr.attendance), 0) / data.length;
        const avgEngagement = data.reduce((acc, curr) => acc + (curr.engagement_score || 0), 0) / data.length;
        
        setPerformanceData({
          grade: avgGrade,
          attendance: Math.round(avgAttendance),
          engagement: Math.round(avgEngagement),
        });
      } else {
        setPerformanceData({ grade: 0, attendance: 0, engagement: 0 });
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      
      toast.success("Usuário excluído com sucesso");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir usuário: " + error.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleIcons: Record<string, React.ElementType> = {
    teacher: GraduationCap,
    professor: GraduationCap,
    student: BookOpen,
    aluno: BookOpen,
    admin: Shield,
    school: Shield,
  };

  const roleLabels: Record<string, string> = {
    teacher: "Professor",
    professor: "Professor",
    student: "Aluno",
    aluno: "Aluno",
    admin: "Administrador",
    school: "Escola",
  };

  const roleColors: Record<string, string> = {
    teacher: "bg-primary/10 text-primary",
    professor: "bg-primary/10 text-primary",
    student: "bg-secondary/10 text-secondary",
    aluno: "bg-secondary/10 text-secondary",
    admin: "bg-gamification-badge/10 text-gamification-badge",
    school: "bg-orange-500/10 text-orange-600",
  };

  return (
    <DashboardLayout role={(currentUser?.role as any) || "admin"} userName={currentUser?.full_name || "Admin"}>
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
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleUserClick(u)}>
                      <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {u.full_name?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.full_name || 'Usuário Sem Nome'}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email} {u.school_name && `· ${u.school_name}`} {u.subject && `· ${u.subject}`} 
                          {u.role === 'teacher' && !u.school_id && <span className="text-[10px] ml-2 text-primary font-bold uppercase">(Solo)</span>}
                          {u.role === 'teacher' && u.school_id && <span className="text-[10px] ml-2 text-secondary font-bold uppercase">(Institucional)</span>}
                        </p>

                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${roleColors[u.role] || "bg-muted text-muted-foreground"}`}>
                        <RoleIcon size={10} /> {roleLabels[u.role] || u.role}
                      </span>
                      {(u.role === 'student' || u.role === 'aluno') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] text-secondary hover:text-secondary-foreground"
                          onClick={(e) => handleShowPerformance(e, u)}
                        >
                          Ver Desempenho
                        </Button>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.subscription_status === "active" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                      }`}>
                        {u.subscription_status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                      {(currentUser?.role === 'admin' || (currentUser?.role === 'school' && u.role !== 'admin')) && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u.id);
                          }}
                        >
                          <X size={14} />
                        </Button>
                      )}
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
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-bold">Novo Usuário</h3>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto max-h-[85vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-4 border-l-4 border-primary pl-2">Informações de Acesso</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Nome Completo</label>
                          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: João Silva" required />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Email</label>
                          <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@exemplo.com" required />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Senha Temporária</label>
                          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="No mínimo 6 caracteres" required minLength={6} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-sm text-secondary uppercase tracking-wider mb-4 border-l-4 border-secondary pl-2">Perfil e Papel</h4>
                      <div className="space-y-4">
                        {currentUser?.role === 'admin' && (
                          <div>
                            <label className="text-xs font-medium mb-1 block">Tipo de Usuário (Hierarquia)</label>
                            <select 
                              value={newRole} 
                              onChange={e => setNewRole(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="school">Escola (Instituição)</option>
                              <option value="teacher">Professor Solo (Assinante)</option>
                              <option value="admin">Administrador Geral</option>
                            </select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {newRole === 'school' ? 'Instituições gerenciam seus próprios professores e alunos.' : 
                               newRole === 'teacher' ? 'Professores solo gerenciam seus próprios alunos e assinaturas.' : 
                               'Administradores têm acesso total ao sistema.'}
                            </p>
                          </div>
                        )}

                        {currentUser?.role === 'school' && (
                          <div>
                            <label className="text-xs font-medium mb-1 block">Tipo de Usuário</label>
                            <select 
                              value={newRole} 
                              onChange={e => setNewRole(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="teacher">Professor da Escola</option>
                              <option value="student">Aluno da Escola</option>
                            </select>
                          </div>
                        )}

                        {(currentUser?.role === 'teacher' || currentUser?.role === 'professor') && !currentUser?.school_id && (
                          <div>
                            <label className="text-xs font-medium mb-1 block">Cadastrar Aluno</label>
                            <Input value="student" disabled className="bg-muted" />
                            <p className="text-[10px] text-muted-foreground mt-1">Como professor solo, você pode cadastrar seus próprios alunos.</p>
                          </div>
                        )}


                        <div>
                          <label className="text-xs font-medium mb-1 block">Bio / Perfil Interno</label>
                          <textarea 
                            value={newBio} 
                            onChange={e => setNewBio(e.target.value)} 
                            placeholder="Breve descrição do perfil (biografia interna)..."
                            className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Role Specific Fields */}
                    {newRole === 'teacher' && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-4">Dados do Professor</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Matéria / Disciplina Principal</label>
                            <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Ex: Matemática, Português..." required />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="specialNeeds" 
                              checked={specialNeedsExpert} 
                              onChange={e => setSpecialNeedsExpert(e.target.checked)}
                              className="w-4 h-4 text-primary"
                            />
                            <label htmlFor="specialNeeds" className="text-xs font-medium">Especialista em Alunos Especiais?</label>
                          </div>
                        </div>
                      </div>
                    )}

                    {newRole === 'student' && (
                      <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                        <h4 className="font-bold text-sm text-secondary uppercase tracking-wider mb-4">Dados do Aluno</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Série / Ano</label>
                            <Input value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} placeholder="Ex: 3º Ano A, 9º Ano B" required />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="hasSpecialNeeds" 
                              checked={hasSpecialNeeds} 
                              onChange={e => setHasSpecialNeeds(e.target.checked)}
                              className="w-4 h-4 text-secondary"
                            />
                            <label htmlFor="hasSpecialNeeds" className="text-xs font-medium">Aluno com Condições Especiais?</label>
                          </div>
                        </div>
                      </div>
                    )}

                    {newRole === 'school' && (
                      <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                        <h4 className="font-bold text-sm text-orange-600 uppercase tracking-wider mb-4">Dados da Instituição</h4>
                        <div className="space-y-3">
                          <Input value={newSchool} onChange={e => setNewSchool(e.target.value)} placeholder="Nome da Escola" required />
                          <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="CNPJ" />
                          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone de Contato" />
                          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço Completo" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button type="submit" className="flex-1 gradient-hero py-6 font-bold text-lg shadow-lg" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : "Criar Usuário Completo"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="py-6 px-8">
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Performance Report Modal */}
      <AnimatePresence>
        {showPerformance && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Relatório de Performance Individual</p>
                  </div>
                </div>
                <button onClick={() => setShowPerformance(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{performanceData.grade.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Média Geral</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="text-3xl font-bold text-secondary mb-1">{performanceData.attendance}%</p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Frequência</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gamification-streak/5 border border-gamification-streak/10 text-center">
                    <p className="text-3xl font-bold text-gamification-streak mb-1">{performanceData.engagement}%</p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Engajamento</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm">Evolução de Competências</h4>
                      <span className="text-[10px] text-muted-foreground">Alinhado à BNCC</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Pensamento Crítico", value: 85 },
                        { label: "Colaboração", value: 92 },
                        { label: "Autonomia", value: 78 }
                      ].map(comp => (
                        <div key={comp.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{comp.label}</span>
                            <span>{comp.value}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${comp.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile View Modal */}
      <AnimatePresence>
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-24 gradient-hero" />
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-12 left-6">
                  <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-hero flex items-center justify-center text-white text-3xl font-bold">
                        {selectedUser.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-14 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.full_name}</h3>
                    <p className="text-muted-foreground">{roleLabels[selectedUser.role] || selectedUser.role} {selectedUser.school_name && `· ${selectedUser.school_name}`}</p>
                  </div>
                  <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {selectedUser.bio && (
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Sobre</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedUser.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">XP Total</span>
                      <span className="font-bold flex items-center gap-1.5 text-primary">
                        <Brain size={14} /> {selectedUser.xp || 0}
                      </span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-[10px] text-muted-foreground uppercase block mb-1">Nível</span>
                      <span className="font-bold flex items-center gap-1.5 text-secondary">
                        <Users size={14} /> Nível {selectedUser.level || 1}
                      </span>
                    </div>
                  </div>

                  {(selectedUser.role === 'student' || selectedUser.role === 'aluno') && (
                    <Button 
                      className="w-full gradient-hero font-bold"
                      onClick={(e) => {
                        setShowProfileModal(false);
                        handleShowPerformance(e as any, selectedUser);
                      }}
                    >
                      Ver Relatório Completo
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

