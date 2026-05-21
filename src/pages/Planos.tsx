import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, School, User, ArrowRight, Loader2, X, Phone, MapPin, Building2, Globe, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  max_students: number;
  max_teachers: number;
  role_type: string;
  features: string[];
  checkout_url?: string;
}

export default function Planos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Detailed registration form
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    taxId: "",
    website: "",
    contactPerson: "",
    schoolName: ""
  });

  useEffect(() => {
    fetchPlans();
    fetchUserProfile();
  }, []);

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("plans").select("*");
    if (error) {
      toast.error("Erro ao carregar planos");
    } else {
      setPlans(data as Plan[]);
    }
    setLoading(false);
  };

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!error) setUserProfile(data);
    }
  };

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      fullName: userProfile?.full_name || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      zipCode: userProfile?.zip_code || "",
      taxId: userProfile?.tax_id || "",
      website: userProfile?.website || "",
      contactPerson: userProfile?.contact_person || "",
      schoolName: userProfile?.school_name || ""
    });
    setShowFormModal(true);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setSubmitting(true);
    try {
      // Update profile with detailed info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          tax_id: formData.taxId,
          website: formData.website,
          contact_person: formData.contactPerson,
          school_name: formData.schoolName || userProfile?.school_name,
        })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      // Redirect to Woovi
      if (selectedPlan.checkout_url) {
        window.open(selectedPlan.checkout_url, '_blank');
        toast.success("Dados salvos! Redirecionando para o checkout...");
        setShowFormModal(false);
      } else {
        toast.error("Checkout indisponível.");
      }
    } catch (error: any) {
      toast.error("Erro ao salvar dados: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="aluno" userName="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userProfile?.role || "aluno"} userName={userProfile?.full_name || "Usuário"}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Escolha seu Plano</h1>
          <p className="text-muted-foreground text-lg">Potencialize o aprendizado com ferramentas profissionais</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card rounded-2xl border-2 p-8 relative flex flex-col ${
                userProfile?.plan_type === plan.name ? 'border-primary' : 'border-border'
              }`}
            >
              {userProfile?.plan_type === plan.name && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                  Plano Atual
                </div>
              )}

              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4">
                  {plan.role_type === 'teacher' ? <User className="text-white" /> : <School className="text-white" />}
                </div>
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">R$ {plan.price_monthly.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-secondary" />
                  </div>
                  <span>Até {plan.max_students} alunos</span>
                </li>
                {plan.max_teachers > 0 && (
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-secondary" />
                    </div>
                    <span>Até {plan.max_teachers} professores</span>
                  </li>
                )}
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-secondary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-6 font-bold text-lg rounded-xl transition-all duration-300 ${
                  userProfile?.plan_type === plan.name 
                  ? 'bg-muted text-muted-foreground cursor-default' 
                  : 'gradient-hero hover:shadow-lg hover:shadow-primary/20 group'
                }`}
                disabled={userProfile?.plan_type === plan.name}
              >
                {userProfile?.plan_type === plan.name ? 'Plano Ativo' : 'Começar Agora'}
                {userProfile?.plan_type !== plan.name && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 grayscale opacity-50">
                <span className="text-[10px] font-medium uppercase tracking-wider">Pagamento via</span>
                <span className="font-bold text-xs italic">Woovi / Pix</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-muted/30 rounded-3xl p-8 border border-border">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Zap size={20} />
                <span>PLANO ADMIN</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Acesso Total para Rede Municipal</h3>
              <p className="text-muted-foreground">
                Gestão completa de múltiplas escolas, faturamento centralizado e relatórios de desempenho de toda a rede.
              </p>
            </div>
            <Button variant="outline" className="px-8 h-12 border-primary text-primary hover:bg-primary/5">
              Falar com Consultor
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
                <div>
                  <h3 className="text-xl font-bold">Registro de Assinatura</h3>
                  <p className="text-xs text-muted-foreground">Complete os dados para o plano: <span className="font-bold text-primary">{selectedPlan?.name}</span></p>
                </div>
                <button onClick={() => setShowFormModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitRegistration} className="p-6 overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                      <UserCircle size={16} /> Responsável
                    </h4>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Nome do Administrador</label>
                      <Input 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Pessoa de Contato / Diretor</label>
                      <Input 
                        value={formData.contactPerson} 
                        onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                        placeholder="Nome para contato"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                        <Phone size={12} /> WhatsApp / Telefone
                      </label>
                      <Input 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                        <Globe size={12} /> Website da Instituição
                      </label>
                      <Input 
                        value={formData.website} 
                        onChange={e => setFormData({...formData, website: e.target.value})} 
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                      <Building2 size={16} /> Dados da Escola
                    </h4>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Nome da Instituição</label>
                      <Input 
                        value={formData.schoolName} 
                        onChange={e => setFormData({...formData, schoolName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">CNPJ / Identificação</label>
                      <Input 
                        value={formData.taxId} 
                        onChange={e => setFormData({...formData, taxId: e.target.value})} 
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">CEP</label>
                        <Input 
                          value={formData.zipCode} 
                          onChange={e => setFormData({...formData, zipCode: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Cidade / UF</label>
                        <Input 
                          value={formData.city} 
                          onChange={e => setFormData({...formData, city: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                        <MapPin size={12} /> Endereço Completo
                      </label>
                      <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t pt-6">
                  <div className="bg-muted/50 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <Check className="text-secondary shrink-0 mt-0.5" size={16} />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Ao clicar em prosseguir, seus dados institucionais serão atualizados no sistema e você será redirecionado para a plataforma segura da <strong>Woovi</strong> para concluir o pagamento via PIX ou Cartão.
                    </p>
                  </div>
                  <Button type="submit" className="w-full gradient-hero py-6 font-bold" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : "Prosseguir para Pagamento"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
