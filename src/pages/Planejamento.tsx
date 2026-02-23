import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { ClipboardList, Brain, Plus, Calendar, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { title: "Equações do 2º Grau", subject: "Matemática", type: "Aula", date: "23/02", status: "IA Gerado", bncc: "EF09MA09" },
  { title: "Romantismo Brasileiro", subject: "Português", type: "Sequência", date: "22/02", status: "Publicado", bncc: "EF09LP01" },
  { title: "Ciclo da Água", subject: "Ciências", type: "Aula", date: "21/02", status: "Rascunho", bncc: "EF09CI02" },
  { title: "Era Vargas", subject: "História", type: "Projeto", date: "20/02", status: "Publicado", bncc: "EF09HI01" },
  { title: "Biomas Brasileiros", subject: "Geografia", type: "Aula", date: "19/02", status: "IA Gerado", bncc: "EF09GE01" },
];

const statusColors: Record<string, string> = {
  "IA Gerado": "bg-gamification-badge/10 text-gamification-badge",
  "Publicado": "bg-secondary/10 text-secondary",
  "Rascunho": "bg-muted text-muted-foreground",
};

const typeColors: Record<string, string> = {
  "Aula": "bg-primary/10 text-primary",
  "Sequência": "bg-gamification-gold/10 text-gamification-gold",
  "Projeto": "bg-gamification-streak/10 text-gamification-streak",
};

export default function Planejamento() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Planejamento</h1>
          <p className="text-muted-foreground text-sm">Crie e organize seus planos de aula com IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar size={16} className="mr-1.5" /> Calendário
          </Button>
          <Button className="gradient-hero border-0 text-primary-foreground">
            <Brain size={16} className="mr-1.5" /> Criar com IA
          </Button>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Plano Diário", icon: FileText, gradient: "gradient-hero" },
          { label: "Plano Semanal", icon: Calendar, gradient: "gradient-success" },
          { label: "Criar Prova", icon: ClipboardList, gradient: "gradient-gamification" },
          { label: "Atividade Interativa", icon: BookOpen, gradient: "gradient-badge" },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${action.gradient} rounded-xl p-4 text-primary-foreground text-left hover:shadow-lg transition-shadow`}
          >
            <action.icon className="w-6 h-6 mb-2 opacity-80" />
            <p className="font-bold text-sm">{action.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Plans list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-primary" /> Planejamentos Recentes
        </h2>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.subject} · {p.date} · BNCC: {p.bncc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[p.type]}`}>{p.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
