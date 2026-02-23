import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Palette, Globe, Database, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "Geral",
    icon: Settings,
    items: [
      { label: "Nome da Plataforma", value: "EduBrasil", type: "text" },
      { label: "Idioma", value: "Português (BR)", type: "select" },
      { label: "Fuso Horário", value: "América/São Paulo", type: "select" },
    ],
  },
  {
    title: "Segurança",
    icon: Shield,
    items: [
      { label: "Autenticação de dois fatores", value: "Ativada", type: "toggle" },
      { label: "Sessão expira em", value: "24 horas", type: "select" },
      { label: "Logs de auditoria", value: "Ativados", type: "toggle" },
    ],
  },
  {
    title: "Notificações",
    icon: Bell,
    items: [
      { label: "Notificações por email", value: "Ativadas", type: "toggle" },
      { label: "Alertas de risco", value: "Ativados", type: "toggle" },
      { label: "Relatórios automáticos", value: "Semanais", type: "select" },
    ],
  },
  {
    title: "LGPD & Privacidade",
    icon: Lock,
    items: [
      { label: "Consentimento de dados", value: "Obrigatório", type: "toggle" },
      { label: "Retenção de dados", value: "5 anos", type: "select" },
      { label: "Exportação de dados", value: "Disponível", type: "toggle" },
    ],
  },
];

export default function Configuracoes() {
  return (
    <DashboardLayout role="admin" userName="Carlos Diretor">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground text-sm">Gerencie as configurações da plataforma</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground">Salvar Alterações</Button>
      </motion.div>

      <div className="space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <section.icon size={18} className="text-primary" /> {section.title}
            </h2>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
