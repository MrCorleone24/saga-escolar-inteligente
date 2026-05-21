import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, PenLine, CheckCircle2, Clock, MessageSquare, Search, 
  Star, Link2, Eye, History, RotateCcw, AlertCircle, FileDown, 
  Bell, CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECTS, NotebookEntry, FeedbackVersion } from "@/lib/subjects";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CadernoAlunos() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [grade, setGrade] = useState("");
  const [viewEntry, setViewEntry] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'aluno');
      if (error) throw error;
      return data;
    }
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['notebook_entries', selected],
    queryFn: async () => {
      if (!selected) return [];
      const { data, error } = await supabase
        .from('notebook_entries')
        .select('*, feedback_versions (*)')
        .eq('student_id', selected)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data as any[]).map(e => ({
        ...e,
        versions: e.feedback_versions
      })) as NotebookEntry[];
    },
    enabled: !!selected
  });

  const filteredStudents = students.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));
  const selectedStudent = students.find(s => s.id === selected);

  const filteredEntries = activeSubject
    ? entries.filter(e => e.subject === activeSubject)
    : entries;

  const viewingEntry = entries.find(e => e.id === viewEntry);

  const handleCorrection = async () => {
    if (!viewingEntry) return;

    // Create a new version record before updating the entry
    const { error: versionError } = await supabase
      .from('feedback_versions')
      .insert({
        entry_id: viewingEntry.id,
        grade: viewingEntry.grade || "Sem nota",
        note: viewingEntry.teacher_note || "Sem comentário",
        status: viewingEntry.status
      });

    if (versionError) {
      toast.error("Erro ao salvar histórico");
      return;
    }

    const { error } = await supabase
      .from('notebook_entries')
      .update({
        status: "corrigido",
        grade: grade,
        teacher_note: correction
      })
      .eq('id', viewingEntry.id);

    if (error) {
      toast.error("Erro ao enviar correção");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['notebook_entries', selected] });
    setViewEntry(null);
    setGrade("");
    setCorrection("");
    toast.success("Correção enviada com sucesso!");
  };

  const handleReopen = () => {
    if (!viewingEntry) return;
    setGrade(viewingEntry.grade || "");
    setCorrection(viewingEntry.teacher_note || "");
    toast.info("A edição da correção foi habilitada.");
  };

  return (
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenLine className="text-gamification-gold" size={24} /> Caderno dos Alunos
          </h1>
          <p className="text-muted-foreground text-sm">Visualize, corrija e comente os cadernos digitais</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="pl-9" />
          </div>
          {filteredStudents.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => { setSelected(s.id); setViewEntry(null); }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold">{s.full_name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">ID: {s.id.substring(0,8)}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Selecione um aluno</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-sm">{selectedStudent.full_name}</h3>
              </div>

              {viewingEntry && (
                <div className="bg-card rounded-xl border p-5">
                  <h4 className="font-bold">{viewingEntry.title}</h4>
                  <div className="text-sm whitespace-pre-wrap mt-2 mb-4 p-4 bg-muted rounded-lg">
                    {viewingEntry.content}
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Nota" value={grade} onChange={e => setGrade(e.target.value)} />
                    <Textarea placeholder="Comentário" value={correction} onChange={e => setCorrection(e.target.value)} />
                    <Button onClick={handleCorrection}>Enviar Correção</Button>
                  </div>
                </div>
              )}

              {filteredEntries.map(entry => (
                <div key={entry.id} className="bg-card rounded-xl border p-4 cursor-pointer" onClick={() => setViewEntry(entry.id)}>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold">{entry.subject}</span>
                    <span className="text-[10px] uppercase">{entry.status}</span>
                  </div>
                  <h4 className="font-bold">{entry.title}</h4>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
