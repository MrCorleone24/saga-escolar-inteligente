import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { PenLine, Search, Plus, Filter, Loader2, Calendar, BookOpen, Clock, X, MessageSquare, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function CadernoAlunos() {
  const queryClient = useQueryClient();
  const { user: userProfile, loading: profileLoading } = useCurrentUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];
      let query = supabase.from('profiles').select('*').eq('role', 'aluno');
      if (userProfile.role === 'school') {
        query = query.eq('school_id', userProfile.id);
      } else if (userProfile.role === 'teacher') {
        query = query.or(`teacher_id.eq.${userProfile.id},school_id.eq.${userProfile.school_id}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile
  });

  const filteredStudents = students.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));

  if (profileLoading) return <DashboardLayout role={(userProfile?.role as any) || "professor"} userName="Carregando..."><div className="p-8"><Loader2 className="animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout role={(userProfile?.role as any) || "professor"} userName={userProfile?.full_name || "Professor"}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenLine className="text-gamification-gold" size={24} /> Caderno dos Alunos
          </h1>
          <p className="text-muted-foreground text-sm">Visualize, corrija e comente os cadernos digitais</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="pl-9" />
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {studentsLoading ? (
              <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : filteredStudents.map((s) => (
              <motion.button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full text-left p-3 mb-2 rounded-xl border transition-all ${selected === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-bold">{s.full_name?.charAt(0)}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.grade_level || "3º Ano"}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </ScrollArea>
        </div>

        <div className="lg:col-span-3 min-h-[60vh] bg-card rounded-2xl border border-border flex flex-col items-center justify-center text-center p-20">
          {selected ? (
            <div className="space-y-4">
              <BookOpen size={48} className="mx-auto text-primary opacity-20" />
              <h2 className="text-xl font-bold">Conteúdo do Caderno</h2>
              <p className="text-muted-foreground">O aluno ainda não enviou atividades para este caderno.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <PenLine size={48} className="mx-auto text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">Selecione um aluno para visualizar o caderno</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
