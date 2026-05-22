import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BookMarked, Search, Plus, Filter, Loader2, Book, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function GerenciarLeitura() {
  const { user: userProfile, loading } = useCurrentUser();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) return <DashboardLayout role={(userProfile?.role as any) || "professor"} userName="Carregando..."><div className="p-8"><Loader2 className="animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout role={(userProfile?.role as any) || "professor"} userName={userProfile?.full_name || "Professor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="text-primary" size={24} /> Gerenciar Leitura
          </h1>
          <p className="text-muted-foreground text-sm">Atribua livros e acompanhe os check-ins dos alunos</p>
        </div>
        <Button className="gradient-hero border-0 text-primary-foreground" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} className="mr-1.5" /> Nova Leitura
        </Button>
      </motion.div>

      <div className="bg-card border-2 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center text-center">
        <Book size={48} className="text-muted-foreground opacity-20 mb-4" />
        <p className="text-muted-foreground">Nenhuma leitura atribuída no momento.</p>
        <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>Criar Primeira Atribuição</Button>
      </div>
    </DashboardLayout>
  );
}
