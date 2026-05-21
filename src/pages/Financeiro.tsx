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
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  method: string;
  invoiceUrl?: string;
}

const MOCK_HISTORY: Payment[] = [
  { id: "INV-2026-05", date: "2026-05-01", description: "Mensalidade Maio/2026", amount: 149.9, status: "paid", method: "PIX (Woovi)" },
  { id: "INV-2026-04", date: "2026-04-01", description: "Mensalidade Abril/2026", amount: 149.9, status: "paid", method: "PIX (Woovi)" },
  { id: "INV-2026-03", date: "2026-03-01", description: "Mensalidade Março/2026", amount: 149.9, status: "paid", method: "Cartão" },
  { id: "INV-2026-06", date: "2026-06-01", description: "Mensalidade Junho/2026", amount: 149.9, status: "pending", method: "Boleto" },
];

const ADMIN_OVERVIEW = [
  { label: "Receita do Mês", value: "R$ 48.230,00", icon: DollarSign, trend: "+12,4%" },
  { label: "Assinaturas Ativas", value: "324", icon: Users, trend: "+8" },
  { label: "Inadimplência", value: "R$ 3.120,00", icon: AlertCircle, trend: "-2,1%" },
  { label: "MRR Projetado", value: "R$ 52.000,00", icon: TrendingUp, trend: "+5,3%" },
];

const statusMap = {
  paid: { label: "Pago", icon: CheckCircle2, cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
  pending: { label: "Pendente", icon: Clock, cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  overdue: { label: "Vencido", icon: AlertCircle, cls: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

export default function Financeiro() {
  const [role, setRole] = useState<Role>("aluno");
  const [userName, setUserName] = useState("Usuário");
  const [loading, setLoading] = useState(true);

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
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
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
            {ADMIN_OVERVIEW.map((s) => (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className="text-primary" size={20} />
                  <Badge variant="secondary" className="text-xs">{s.trend}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-1">{s.value}</p>
              </Card>
            ))}
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
                {MOCK_HISTORY.map((p) => {
                  const s = statusMap[p.status];
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{p.id}</td>
                      <td className="py-3 pr-4">{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 pr-4">{p.description}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.method}</td>
                      <td className="py-3 pr-4 font-semibold">R$ {p.amount.toFixed(2)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${s.cls}`}>
                          <s.icon size={12} /> {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
