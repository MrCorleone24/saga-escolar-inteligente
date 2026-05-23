import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, Trophy, BarChart3,
  GraduationCap, Dumbbell, Settings, LogOut, ChevronLeft,
  ChevronRight, Presentation, ClipboardList, Brain, Menu,
  PenLine, Calendar, BookMarked, Video, DollarSign
} from "lucide-react";


type Role = "aluno" | "professor" | "admin" | "school" | "teacher_solo" | "teacher_institutional";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["aluno", "teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Minhas Aulas", icon: BookOpen, path: "/aulas", roles: ["aluno", "admin"] },
  { label: "Salas Virtuais", icon: Video, path: "/salas", roles: ["aluno", "teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Meu Caderno", icon: PenLine, path: "/meu-caderno", roles: ["aluno"] },
  { label: "Calendário", icon: Calendar, path: "/calendario", roles: ["aluno", "teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Leitura", icon: BookMarked, path: "/leitura", roles: ["aluno"] },
  { label: "Conquistas", icon: Trophy, path: "/conquistas", roles: ["aluno"] },
  { label: "Esportes", icon: Dumbbell, path: "/esportes", roles: ["aluno"] },
  { label: "Turmas", icon: Users, path: "/turmas", roles: ["teacher_solo", "teacher_institutional", "school", "admin"] },
  { label: "Planejamento", icon: ClipboardList, path: "/planejamento", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Caderno Alunos", icon: PenLine, path: "/caderno-alunos", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Gerenciar Leitura", icon: BookMarked, path: "/gerenciar-leitura", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "IA Pedagógica", icon: Brain, path: "/ia-pedagogica", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Lousa Digital", icon: Presentation, path: "/lousa", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios", roles: ["teacher_solo", "teacher_institutional", "admin", "school"] },
  { label: "Gestão Escolar", icon: GraduationCap, path: "/escolas", roles: ["admin", "school"] },
  { label: "Usuários", icon: Users, path: "/usuarios", roles: ["admin", "school"] },
  { label: "Financeiro", icon: DollarSign, path: "/financeiro", roles: ["admin", "school", "teacher_solo", "teacher_institutional"] },
  { label: "Configurações", icon: Settings, path: "/configuracoes", roles: ["admin", "school", "teacher_solo", "teacher_institutional"] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
  userName: string;
  userAvatar?: string;
  xp?: number;
  level?: number;
}

export default function DashboardLayout({ children, role: initialRole, userName, xp = 0, level = 1 }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperUser = userProfile?.role === "admin";

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setUserProfile(profile);
          let roleToSet = profile.role as Role;
          if (roleToSet === 'professor') {
            roleToSet = profile.teacher_category === 'solo' ? 'teacher_solo' : 'teacher_institutional';
          }
          
          const savedViewRole = localStorage.getItem('admin_view_role');
          if (profile.role === "admin" && savedViewRole) {
            setCurrentRole(savedViewRole as Role);
          } else {
            setCurrentRole(roleToSet);
          }
        }
      }
    };
    fetchUser();
  }, [initialRole]);

  const filteredItems = navItems.filter(item => item.roles.includes(currentRole));


  const handleRoleSwitch = (newRole: Role) => {
    setCurrentRole(newRole);
    localStorage.setItem('admin_view_role', newRole);
    
    // Redirect logic to the correct home page for each role
    if (newRole === "aluno") {
      navigate("/dashboard");
    } else if (newRole === "teacher_solo" || newRole === "teacher_institutional" || newRole === "professor") {
      navigate("/professor");
    } else if (newRole === "school" || newRole === "admin") {
      navigate("/admin");
    }
  };

  const roleLabels: Record<string, string> = {
    aluno: "Aluno",
    professor: "Professor",
    teacher_solo: "Professor (Solo)",
    teacher_institutional: "Professor",
    admin: "Administrador",
    school: "Escola",
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="font-bold text-sidebar-foreground text-sm leading-tight">EduBrasil</h1>
            <p className="text-[10px] text-sidebar-foreground/50">Plataforma Inteligente</p>
          </motion.div>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gradient-gamification flex items-center justify-center shrink-0 text-accent-foreground font-bold text-sm">
            {userName.charAt(0)}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/50">{roleLabels[currentRole]}</p>
            </motion.div>
          )}
        </div>
        {isSuperUser && !collapsed && (
          <div className="mt-4 px-2">
            <p className="text-[10px] uppercase font-bold text-sidebar-foreground/40 mb-2">Alternar Modo</p>
            <div className="grid grid-cols-2 gap-1">
              {(["aluno", "teacher_solo", "teacher_institutional", "school", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-[10px] py-1 px-2 rounded border transition-colors ${
                    currentRole === r 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-sidebar-border text-sidebar-foreground/60 hover:bg-sidebar-accent"
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
        )}
        {currentRole === "aluno" && !collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-sidebar-foreground/60 mb-1">
              <span>Nível {level}</span>
              <span>{xp} XP</span>
            </div>
            <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gamification-xp"
                initial={{ width: 0 }}
                animate={{ width: `${(xp % 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }
              `}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[260px] bg-sidebar z-50 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar transition-all duration-300 shrink-0 ${
          collapsed ? "w-[68px]" : "w-[250px]"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-6 -right-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
          style={{ left: collapsed ? 56 : 238 }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-muted">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">EduBrasil</span>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}