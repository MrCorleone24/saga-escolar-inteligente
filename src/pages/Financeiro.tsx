import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, CreditCard, Download, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type Role = "admin" | "school" | "professor" | "aluno";

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
};

const statusMap = {
  paid: { label: "Pago", icon: CheckCircle2, cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
  pending: { label: "Pendente", icon: Clock, cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  overdue: { label: "Vencido", icon: AlertCircle, cls: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

export default function Financeiro() {
  const [role, setRole] = useState<Role>("aluno");
  const [userName, setUserName] = useState("Usuário");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    mrr: 0,
    activeSubs: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
        if (profile) {
          setRole((profile.role as Role) ?? "aluno");
          setUserName(profile.full_name ?? user.email ?? "Usuário");
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
  const isProfessor = role === "professor";


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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-primary" size={20} />
                <Badge variant="secondary" className="text-xs">+5.2%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">MRR Projetado</p>
              <p className="text-xl font-bold mt-1">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="text-primary" size={20} />
                <Badge variant="secondary" className="text-xs">Ativo</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Assinaturas Ativas</p>
              <p className="text-xl font-bold mt-1">{stats.activeSubs}</p>
            </Card>
          </div>
        )}

        {!isAdmin && (
          <Card className="p-5 gradient-hero text-white border-0">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs opacity-80">Plano ativo</p>
                <h2 className="text-xl font-bold">
                  {isSchool ? "Plano Escola (Institucional)" : isProfessor ? "Plano Professor (Profissional)" : "Plano Aluno (Básico)"}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {isSchool ? "Gestão total de alunos e professores ilimitados" : isProfessor ? "Gestão de até 50 alunos inclusa" : "Acesso completo às aulas e materiais"}
                </p>
                <p className="text-xs font-semibold mt-2">Próximo vencimento: 01/06/2026 — R$ {isSchool ? "499,90" : isProfessor ? "149,90" : "49,90"}</p>
              </div>
              <Button variant="secondary" onClick={handleTestPayment} className="font-bold">
                <CreditCard className="mr-2" size={16} /> Renovação via Woovi
              </Button>
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
