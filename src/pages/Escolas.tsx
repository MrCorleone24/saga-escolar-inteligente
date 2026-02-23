import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, TrendingUp, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const schools = [
  { name: "E.M. Monteiro Lobato", city: "São Paulo, SP", students: 420, teachers: 28, avg: 7.9, status: "Ativa" },
  { name: "E.M. Cecília Meireles", city: "Rio de Janeiro, RJ", students: 380, teachers: 24, avg: 8.1, status: "Ativa" },
  { name: "E.M. Machado de Assis", city: "Belo Horizonte, MG", students: 350, teachers: 22, avg: 7.5, status: "Ativa" },
  { name: "E.M. Carlos Drummond", city: "Curitiba, PR", students: 290, teachers: 18, avg: 7.8, status: "Em implantação" },
];

export default function Escolas() {
  return (
    <DashboardLayout role="admin" userName="Carlos Diretor">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Escolas</h1>
          <p className="text-muted-foreground text-sm">Gerencie as escolas da rede</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">
          <Plus size={16} className="mr-1.5" /> Nova Escola
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Escolas" value="4" icon={<School size={20} />} gradient="hero" subtitle="Na rede" />
        <StatCard title="Alunos" value="1.440" icon={<Users size={20} />} gradient="success" />
        <StatCard title="Professores" value="92" icon={<GraduationCap size={20} />} gradient="gamification" />
        <StatCard title="Média Rede" value="7.8" icon={<TrendingUp size={20} />} gradient="badge" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5">
        <div className="space-y-3">
          {schools.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                  <School className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={10} /> {s.city}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.teachers} professores · {s.students} alunos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-bold text-lg">{s.avg}</p>
                  <p className="text-[10px] text-muted-foreground">Média</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                  s.status === "Ativa" ? "bg-secondary/10 text-secondary" : "bg-gamification-gold/10 text-gamification-gold"
                }`}>
                  {s.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
