import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Sparkles, BookOpen, ClipboardList, Target, MessageSquare, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const aiFeatures = [
  { title: "Plano de Aula", desc: "Gere planos alinhados à BNCC", icon: BookOpen, gradient: "gradient-hero" },
  { title: "Exercícios", desc: "Crie exercícios adaptados ao nível da turma", icon: ClipboardList, gradient: "gradient-success" },
  { title: "Avaliações", desc: "Provas com gabarito automático", icon: FileText, gradient: "gradient-gamification" },
  { title: "Intervenções", desc: "Sugestões pedagógicas personalizadas", icon: Target, gradient: "gradient-badge" },
];

const recentGenerations = [
  { title: "Plano: Equações 2º Grau", type: "Plano de Aula", time: "Há 2h", tokens: 1200 },
  { title: "10 Exercícios de Geometria", type: "Exercícios", time: "Há 5h", tokens: 800 },
  { title: "Prova Bimestral - Álgebra", type: "Avaliação", time: "Ontem", tokens: 1500 },
  { title: "Intervenção: João Mendes", type: "Intervenção", time: "Ontem", tokens: 600 },
];

export default function IAPedagogica() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-gamification-badge" /> IA Pedagógica
        </h1>
        <p className="text-muted-foreground text-sm">Seu assistente inteligente para criar conteúdos educacionais</p>
      </motion.div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-badge rounded-xl p-6 text-primary-foreground mb-6"
      >
        <div className="flex items-start gap-4">
          <Sparkles className="w-10 h-10 opacity-80 shrink-0" />
          <div>
            <h2 className="font-bold text-xl mb-1">Agente IA Pedagógico</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Gere planos de aula, exercícios, avaliações e intervenções pedagógicas alinhados à BNCC.
              A IA utiliza o contexto da turma e o desempenho dos alunos para personalizar o conteúdo.
            </p>
            <Button variant="secondary" className="font-semibold">
              <MessageSquare size={16} className="mr-1.5" /> Iniciar Conversa com IA
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {aiFeatures.map((f, i) => (
          <motion.button
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`${f.gradient} rounded-xl p-5 text-primary-foreground text-left hover:shadow-lg transition-shadow`}
          >
            <f.icon className="w-7 h-7 mb-3 opacity-80" />
            <h3 className="font-bold text-sm mb-1">{f.title}</h3>
            <p className="text-primary-foreground/70 text-xs">{f.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Recent generations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <Zap size={18} className="text-gamification-gold" /> Gerações Recentes
        </h2>
        <div className="space-y-3">
          {recentGenerations.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg gradient-badge flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.type} · {g.time}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{g.tokens} tokens</span>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
