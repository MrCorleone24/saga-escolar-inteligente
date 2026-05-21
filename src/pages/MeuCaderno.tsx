import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  PenLine, MessageSquare, Star, ChevronLeft, ChevronRight,
  BookOpen, Camera, Save, RotateCcw, Plus, Check, Clock, Link2,
  FileDown, Search, Filter, History, CheckCircle2, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SUBJECTS, NotebookEntry, FeedbackVersion } from "@/lib/subjects";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", icon: PenLine, color: "text-muted-foreground", bg: "bg-muted" },
  enviado: { label: "Enviado", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  pendente: { label: "Pendente", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  corrigido: { label: "Corrigido", icon: Check, color: "text-emerald-600", bg: "bg-emerald-50" },
  devolvido: { label: "Devolvido", icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
  confirmado: { label: "Confirmado", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
};

export default function MeuCaderno() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSubject, setActiveSubject] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [isWriting, setIsWriting] = useState(false);
  const [viewMode, setViewMode] = useState<"notebook" | "list">("notebook");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['notebook_entries', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notebook_entries')
        .select(`
          *,
          feedback_versions (*)
        `)
        .eq('student_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data as any[]).map(e => ({
        ...e,
        photo: e.photo_url,
        teacherNote: e.teacher_note,
        lessonId: e.lesson_id,
        confirmedAt: e.confirmed_at,
        versions: e.feedback_versions
      })) as NotebookEntry[];
    },
    enabled: !!userId
  });

  const subject = SUBJECTS[activeSubject];
  
  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchesSubject = viewMode === "notebook" ? e.subject === subject.name : true;
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "todos" ? true : e.status === statusFilter;
      
      return matchesSubject && matchesSearch && matchesStatus;
    });
  }, [entries, subject.name, searchQuery, statusFilter, viewMode]);

  const currentEntry = filtered[currentPage] || null;

  const handleConfirmReading = async (entryId: string) => {
    const { error } = await supabase
      .from('notebook_entries')
      .update({ 
        status: "confirmado", 
        confirmed_at: new Date().toISOString() 
      })
      .eq('id', entryId);

    if (error) {
      toast.error("Erro ao confirmar leitura");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['notebook_entries'] });
    toast.success("Feedback confirmado com sucesso!");
  };

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PenLine className="text-primary" size={24} /> Meu Caderno Digital
        </h1>
      </motion.div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {SUBJECTS.map((s, i) => {
          const count = entries.filter(e => e.subject === s.name).length;
          return (
            <motion.button
              key={s.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveSubject(i); setCurrentPage(0); setIsWriting(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
                activeSubject === i
                  ? "text-primary-foreground shadow-lg"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
              style={activeSubject === i ? { backgroundColor: `hsl(${s.color})`, borderColor: `hsl(${s.color})` } : {}}
            >
              {s.emoji} {s.name} {activeSubject === i && count > 0 && <span className="bg-white/20 rounded-full px-1.5 text-[10px]">{count}</span>}
            </motion.button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((entry, i) => (
          <div key={entry.id} className="bg-card rounded-xl border p-4">
            <h4 className="font-bold">{entry.title}</h4>
            <p className="text-xs text-muted-foreground">{entry.date}</p>
            {entry.teacher_note && (
              <div className="mt-2 bg-muted p-2 rounded-lg text-xs">
                <p>Professor: {entry.teacher_note}</p>
                {entry.status !== 'confirmado' && (
                  <Button size="sm" onClick={() => handleConfirmReading(entry.id)}>Confirmar Leitura</Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
