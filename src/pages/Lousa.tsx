import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Presentation, Brain, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanvasBoard from "@/components/lousa/CanvasBoard";
import { toast } from "sonner";

export default function Lousa() {
  const navigate = useNavigate();
  return (
    <DashboardLayout role="professor" userName="Professor">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Presentation className="text-primary" size={24} /> Lousa Digital Colaborativa
          </h1>
          <p className="text-muted-foreground text-sm">Espaço de criação em tempo real para professores e alunos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" onClick={() => toast.info("Link de compartilhamento copiado!")}>
            <Share2 size={16} className="mr-1.5" /> Compartilhar Lousa
          </Button>
          <Button className="gradient-badge border-0 text-primary-foreground shadow-lg" onClick={() => navigate("/ia-pedagogica")}>
            <Brain size={16} className="mr-1.5" /> Assistente de Conteúdo IA
          </Button>
        </div>
      </motion.div>
      <CanvasBoard />
    </DashboardLayout>
  );
}
