import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Palette, Globe, Database, Lock, Mail, User, Camera, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setBio(data.bio || "");
        setFullName(data.full_name || "");
      }
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role={(profile?.role as any) || "admin"} userName={profile?.full_name || "Usuário"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground text-sm">Gerencie sua conta e as preferências da plataforma</p>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} className="gradient-hero border-0 text-primary-foreground">
          {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : "Salvar Alterações"}
        </Button>
      </motion.div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" /> Meu Perfil
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-border shadow-inner">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-hero flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.full_name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl text-white">
                  <Camera size={24} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Recomendado: 400x400px</p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nome Completo</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Email</label>
                  <Input value={profile?.email || ""} disabled className="bg-muted" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Bio / Apresentação Interna</label>
                <Textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  placeholder="Conte um pouco sobre você para outros membros..."
                  className="h-32 resize-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (si + 1) * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 relative group/section"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover/section:opacity-100 transition-opacity">
               <Button variant="ghost" size="sm" onClick={() => toast.info("Funcionalidade de salvamento para esta seção será ativada na integração final.")}>
                 <Save size={14} className="mr-2" /> Alterar
               </Button>
            </div>
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <section.icon size={18} className="text-primary" /> {section.title}
            </h2>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Configuração de Produção</span>
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/5 px-2 py-1 rounded">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
