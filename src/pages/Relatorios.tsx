import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, Download, Calendar, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Set", media: 7.2, presenca: 88 },
  { month: "Out", media: 7.5, presenca: 90 },
  { month: "Nov", media: 7.8, presenca: 89 },
  { month: "Dez", media: 7.6, presenca: 85 },
  { month: "Jan", media: 8.0, presenca: 92 },
  { month: "Fev", media: 8.3, presenca: 91 },
];

const subjectData = [
  { subject: "Mat", avg: 8.5 },
  { subject: "Port", avg: 9.0 },
  { subject: "Ciên", avg: 7.5 },
  { subject: "Hist", avg: 9.5 },
  { subject: "Geo", avg: 6.8 },
  { subject: "Ing", avg: 7.8 },
];

export default function Relatorios() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Acompanhe a evolução das turmas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar size={16} className="mr-1.5" /> Período</Button>
          <Button variant="outline"><Download size={16} className="mr-1.5" /> Exportar</Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Média Geral", value: "8.3", change: "+0.5", icon: TrendingUp },
          { label: "Frequência", value: "91%", change: "+2%", icon: Users },
          { label: "Aprovação", value: "94%", change: "+3%", icon: BookOpen },
          { label: "Relatórios", value: "12", change: "Este mês", icon: BarChart3 },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className="text-primary" />
              <span className="text-xs text-secondary font-medium">{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Evolução Mensal
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="media" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Média" />
              <Line type="monotone" dataKey="presenca" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} name="Presença %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-secondary" /> Média por Disciplina
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Média" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
