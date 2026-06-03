import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, CreditCard, Download, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type Role = "aluno" | "professor" | "admin" | "school" | "teacher_solo" | "teacher_institutional";

interface Payment {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  status: string;
  payment_method: string;
}

const statusMap = {
  paid: { label: "Pago", icon: CheckCircle2, cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
  pending: { label: "Pendente", icon: Clock, cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  failed: { label: "Falhou", icon: AlertCircle, cls: "bg-red-500/15 text-red-700 dark:text-red-400" },
  overdue: { label: "Vencido", icon: AlertCircle, cls: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

export default function Financeiro() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("aluno");
  const [userName, setUserName] = useState("Usuário");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    mrr: 0,
    activeSubs: 0,
  });

  const { user, loading: profileLoading, role: currentRole } = useCurrentUser();
  
  useEffect(() => {
    if (!profileLoading && user) {
      setRole(currentRole as Role);
      setUserName(user.full_name ?? "Usuário");
      
      (async () => {
        try {
        if (profile) {
          if (currentRole === 'teacher_institutional') {
            toast.error("Acesso restrito ao financeiro institucional");
            navigate("/dashboard");
            return;
          }
        }

        // Fetch history
        const { data: histData } = await supabase
          .from("financial_history")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (histData) setHistory(histData as any);

        if (profile?.role === 'admin') {
          const { data: subs } = await supabase.from("profiles").select("role").eq("subscription_status", "active");
          const { data: monthlyRevenue } = await supabase.rpc('get_monthly_revenue');
          
          setStats({
            mrr: monthlyRevenue || 0,
            activeSubs: subs?.length || 0,
          });
        }

      } catch (e) {
        console.error("Erro ao carregar dados financeiros:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAdmin = role === "admin";
  const isSchool = role === "school";
  const isProfessor = role === "teacher_solo" || role === "professor";


  const handleTestPayment = async () => {
    // Placeholder: integração Woovi sandbox
    window.open("https://app.woovi.com/", "_blank");
  };

  return (
    <DashboardLayout role={role} userName={userName}>
      <div className="space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Financeiro</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Controle financeiro global da plataforma"
                : "Seu histórico de pagamentos e mensalidades"}
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleTestPayment} className="gradient-hero text-white border-0">
              <CreditCard className="mr-2" size={16} /> Testar Pagamento (Woovi Sandbox)
            </Button>
          )}
        </header>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-l-4 border-primary">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-primary" size={20} />
                <Badge variant="secondary" className="text-xs">Meta: 85%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">MRR Total (Global)</p>
              <p className="text-xl font-bold mt-1">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </Card>
            <Card className="p-4 border-l-4 border-secondary">
              <div className="flex items-center justify-between mb-2">
                <Users className="text-secondary" size={20} />
                <Badge variant="outline" className="text-[10px]">Escolas: {history.filter(h => h.description.includes('Escola')).length}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Assinaturas Ativas</p>
              <p className="text-xl font-bold mt-1">{stats.activeSubs}</p>
            </Card>
            <Card className="p-4 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-amber-500" size={20} />
                <Badge variant="outline" className="text-[10px]">Churn: 1.2%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Crescimento Mensal</p>
              <p className="text-xl font-bold mt-1">+12.5%</p>
            </Card>
            <Card className="p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="text-blue-500" size={20} />
                <Badge variant="outline" className="text-[10px]">PIX: 92%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Inadimplência</p>
              <p className="text-xl font-bold mt-1">2.4%</p>
            </Card>
          </div>
        )}

        {!isAdmin && (
          <Card className="p-5 gradient-hero text-white border-0">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs opacity-80">Plano ativo</p>
                <h2 className="text-xl font-bold">
                  {isSchool ? "Plano Escola (Institucional)" : isProfessor ? "Plano Professor Solo (Upgrade)" : "Plano Aluno (Básico)"}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {isSchool ? "Gestão total de alunos e professores ilimitados" : isProfessor ? "Gestão de alunos e turmas ilimitadas (Modo Solo)" : "Acesso completo às aulas e materiais"}
                </p>
                <p className="text-xs font-semibold mt-2">Próximo vencimento: Próximo Mês — R$ {isSchool ? "499,90" : isProfessor ? "149,90" : "49,90"}</p>
              </div>
              {isProfessor && (
                <div className="flex flex-col gap-2">
                   <Button variant="secondary" onClick={handleTestPayment} className="font-bold">
                    <TrendingUp className="mr-2" size={16} /> Fazer Upgrade para Premium
                  </Button>
                  <Button variant="ghost" onClick={handleTestPayment} className="text-white hover:bg-white/10">
                    <CreditCard className="mr-2" size={16} /> Renovar Assinatura
                  </Button>
                </div>
              )}
              {!isProfessor && (
                <Button variant="secondary" onClick={handleTestPayment} className="font-bold">
                  <CreditCard className="mr-2" size={16} /> Renovação via Woovi
                </Button>
              )}
            </div>
          </Card>
        )}


        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Histórico de Pagamentos</h2>
            <Button variant="outline" size="sm"><Download size={14} className="mr-1" /> Exportar</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2 pr-4">Fatura</th>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Descrição</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2 pr-4">Valor</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => {
                  const s = statusMap[p.status as keyof typeof statusMap] || statusMap.pending;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{p.id.substring(0, 8)}</td>
                      <td className="py-3 pr-4">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4">{p.description}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.payment_method}</td>
                      <td className="py-3 pr-4 font-semibold">R$ {Number(p.amount).toFixed(2)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${s.cls}`}>
                          <s.icon size={12} /> {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {isAdmin && (
          <Card className="p-5">
            <h2 className="font-semibold mb-3">Modo Teste de Pagamento</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Use o ambiente sandbox da Woovi para validar fluxos de PIX, boleto e cartão sem cobranças reais.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleTestPayment}>Gerar PIX Teste</Button>
              <Button variant="outline" onClick={handleTestPayment}>Gerar Boleto Teste</Button>
              <Button variant="outline" onClick={handleTestPayment}>Cobrança Recorrente</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
