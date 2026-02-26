import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Presentation, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanvasBoard from "@/components/lousa/CanvasBoard";

export default function Lousa() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Presentation className="text-primary" size={24} /> Lousa Digital
          </h1>
          <p className="text-muted-foreground text-sm">Escreva, desenhe, adicione emojis e stickers animados</p>
        </div>
        <Button className="gradient-badge border-0 text-primary-foreground">
          <Brain size={16} className="mr-1.5" /> Gerar Conteúdo com IA
        </Button>
      </motion.div>
      <CanvasBoard />
    </DashboardLayout>
  );
}
