import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Brain, Plus, Calendar, BookOpen, FileText, ClipboardList, Video, PenLine, Layers, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LessonPlanForm from "@/components/planejamento/LessonPlanForm";

export default function CriarAula() {
  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Criar Nova Aula</h1>
          <p className="text-muted-foreground text-sm">Crie aulas interativas, de caderno ou baseadas em vídeo</p>
        </div>
      </motion.div>
      <LessonPlanForm onSave={() => window.history.back()} onClose={() => window.history.back()} />
    </DashboardLayout>
  );
}
