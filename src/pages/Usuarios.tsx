import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, UserPlus, Search, Shield, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const users = [
  { name: "Prof. Maria Santos", email: "maria@edubrasil.com", role: "Professor", school: "E.M. Monteiro Lobato", status: "Ativo" },
  { name: "Lucas Silva", email: "lucas@edubrasil.com", role: "Aluno", school: "E.M. Monteiro Lobato", status: "Ativo" },
  { name: "Carlos Diretor", email: "carlos@edubrasil.com", role: "Admin", school: "Rede Municipal", status: "Ativo" },
  { name: "Ana Costa", email: "ana@edubrasil.com", role: "Aluno", school: "E.M. Cecília Meireles", status: "Ativo" },
  { name: "Prof. João Lima", email: "joao@edubrasil.com", role: "Professor", school: "E.M. Machado de Assis", status: "Inativo" },
  { name: "Pedro Santos", email: "pedro@edubrasil.com", role: "Aluno", school: "E.M. Monteiro Lobato", status: "Ativo" },
];

const roleIcons: Record<string, React.ElementType> = {
  Professor: GraduationCap,
  Aluno: BookOpen,
  Admin: Shield,
};

const roleColors: Record<string, string> = {
  Professor: "bg-primary/10 text-primary",
  Aluno: "bg-secondary/10 text-secondary",
  Admin: "bg-gamification-badge/10 text-gamification-badge",
};

export default function Usuarios() {
  return (
    <DashboardLayout role="admin" userName="Carlos Diretor">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <UserPlus size={16} className="mr-1.5" /> Novo Usuário
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-3 mb-6 flex items-center gap-3">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou escola..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </motion.div>

      {/* Users list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
        <div className="space-y-2">
          {users.map((u, i) => {
            const RoleIcon = roleIcons[u.role] || Users;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.school}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${roleColors[u.role]}`}>
                    <RoleIcon size={10} /> {u.role}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    u.status === "Ativo" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"
                  }`}>
                    {u.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
