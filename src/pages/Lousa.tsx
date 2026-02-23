import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Presentation, Pen, Type, Shapes, Eraser, Download, Brain, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  { name: "Caneta", icon: Pen, active: true },
  { name: "Texto", icon: Type, active: false },
  { name: "Formas", icon: Shapes, active: false },
  { name: "Apagar", icon: Eraser, active: false },
];

const colors = [
  "bg-foreground", "bg-primary", "bg-secondary", "bg-destructive", "bg-gamification-gold", "bg-gamification-badge",
];

export default function Lousa() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lousa Digital</h1>
          <p className="text-muted-foreground text-sm">Escreva, desenhe e gere conteúdo com IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-1.5" /> Exportar PDF
          </Button>
          <Button className="gradient-badge border-0 text-primary-foreground">
            <Brain size={16} className="mr-1.5" /> Gerar com IA
          </Button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-3 mb-4 flex items-center gap-4">
        <div className="flex gap-1">
          {tools.map(t => (
            <button
              key={t.name}
              className={`p-2.5 rounded-lg transition-colors ${t.active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            >
              <t.icon size={18} />
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex gap-1.5">
          {colors.map((c, i) => (
            <button key={i} className={`w-6 h-6 rounded-full ${c} ${i === 0 ? "ring-2 ring-primary ring-offset-2" : ""}`} />
          ))}
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-muted-foreground" />
          <input type="range" min="1" max="10" defaultValue="3" className="w-20 accent-primary" />
        </div>
      </motion.div>

      {/* Canvas area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border-2 border-dashed border-border flex items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <div className="text-center text-muted-foreground">
          <Presentation className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-lg mb-1">Lousa Digital Interativa</p>
          <p className="text-sm">Clique para começar a escrever ou use a IA para gerar conteúdo</p>
          <Button className="mt-4 gradient-hero border-0 text-primary-foreground">
            <Pen size={14} className="mr-1.5" /> Começar
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
