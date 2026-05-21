import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Check, Zap, School, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export default function Planos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

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

  const handleSubscribe = async (plan: Plan) => {
    toast.info(`Iniciando assinatura do plano ${plan.name}...`);
    
    // Simulate Woovi Pix Payment
    // In a real scenario, we would call an edge function that interacts with Woovi API
    setTimeout(async () => {
      const { error } = await supabase.from("profiles").update({
        plan_type: plan.name,
        role: plan.role_type,
        max_students: plan.max_students,
        max_teachers: plan.max_teachers,
        subscription_status: 'active'
      }).eq("id", userProfile.id);

      if (error) {
        toast.error("Erro ao atualizar plano");
      } else {
        toast.success(`Parabéns! Agora você é ${plan.name}`);
        fetchUserProfile();
      }
    }, 2000);
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
    </DashboardLayout>
  );
}
