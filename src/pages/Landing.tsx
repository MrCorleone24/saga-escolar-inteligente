import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen, Brain, Trophy, BarChart3, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "IA Pedagógica",
    description: "Planos de aula, exercícios e avaliações gerados por IA alinhados à BNCC.",
    gradient: "gradient-hero",
  },
  {
    icon: Trophy,
    title: "Gamificação",
    description: "XP, níveis, medalhas e ranking para engajar os alunos no aprendizado.",
    gradient: "gradient-gamification",
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Acompanhamento completo com métricas de desempenho e análise de risco.",
    gradient: "gradient-success",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description: "Gerencie múltiplas escolas com controle total de turmas e permissões.",
    gradient: "gradient-badge",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">EduBrasil</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/planos">
              <Button size="sm" className="gradient-hero border-0 text-primary-foreground">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles size={14} />
              Alinhado à BNCC
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              A escola digital mais
              <span className="text-gradient-hero"> inteligente </span>
              do Brasil
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Plataforma completa com IA pedagógica, gamificação avançada e monitoramento de alunos. 
              Tudo que professores e escolas precisam em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button size="lg" className="gradient-hero border-0 text-primary-foreground px-8 text-base">
                  Começar Agora <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 text-base">
                  Ver Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Tudo que sua escola precisa</h2>
            <p className="text-muted-foreground">Recursos poderosos para transformar a educação</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${f.gradient} flex items-center justify-center mb-4`}>
                  <f.icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">13+ Disciplinas</h2>
            <p className="text-muted-foreground">Conteúdo completo do Ensino Fundamental ao Médio</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "Português", "Matemática", "Ciências", "História", "Geografia",
              "Inglês", "Espanhol", "Filosofia", "Sociologia", "Ed. Física",
              "Tecnologia", "Empreendedorismo", "Literatura"
            ].map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-2 bg-background rounded-full text-sm font-medium border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="gradient-hero rounded-3xl p-10 md:p-14"
          >
            <BookOpen className="w-10 h-10 text-primary-foreground/80 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              Pronto para transformar sua escola?
            </h2>
            <p className="text-primary-foreground/70 mb-6 max-w-lg mx-auto">
              Junte-se a centenas de escolas que já utilizam IA para melhorar o aprendizado.
            </p>
            <Link to="/planos">
              <Button size="lg" variant="secondary" className="px-8 text-base font-semibold">
                Ver Planos e Preços <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-hero flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">EduBrasil</span>
          </div>
          <p>© 2026 EduBrasil. Plataforma educacional inteligente.</p>
        </div>
      </footer>
    </div>
  );
}
