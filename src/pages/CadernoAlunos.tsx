import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, PenLine, CheckCircle2, Clock, MessageSquare, Search, 
  Star, Link2, Eye, History, RotateCcw, AlertCircle, FileDown, 
  Bell, CheckCircle, FileIcon, ImageIcon
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

  useEffect(() => {
    // Realtime listener for entry updates (e.g. when student confirms reading)
    const channel = supabase
      .channel('entries_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notebook_entries' },
        (payload) => {
          if (selected && payload.new.student_id === selected) {
            queryClient.invalidateQueries({ queryKey: ['notebook_entries', selected] });
            if (payload.new.status === 'confirmado') {
              toast.success("O aluno confirmou a leitura do feedback!");
            }
          }
        }
      )
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [selected, queryClient]);

  const filteredStudents = students.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));
  const selectedStudent = students.find(s => s.id === selected);

  const filteredEntries = activeSubject
    ? entries.filter(e => e.subject === activeSubject)
    : entries;

  const viewingEntry = entries.find(e => e.id === viewEntry);

  const handleCorrection = async () => {
    if (!viewingEntry) return;

    // Create a new version record before updating the entry
    await supabase.from('feedback_versions').insert({
      entry_id: viewingEntry.id,
      grade: viewingEntry.grade || "Sem nota",
      note: viewingEntry.teacher_note || "Sem comentário",
      status: viewingEntry.status
    });

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

    // Notify student
    await supabase.from('notifications').insert({
      user_id: viewingEntry.student_id,
      title: "Correção Recebida",
      message: `O professor corrigiu sua atividade de ${viewingEntry.subject}.`,
      type: "feedback_updated",
      metadata: { entry_id: viewingEntry.id }
    });

    queryClient.invalidateQueries({ queryKey: ['notebook_entries', selected] });
    setViewEntry(null);
    setGrade("");
    setCorrection("");
    toast.success("Correção enviada com sucesso!");
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="pl-9" />
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {filteredStudents.map((s) => (
              <motion.button
                key={s.id}
                onClick={() => { setSelected(s.id); setViewEntry(null); }}
                className={`w-full text-left p-3 mb-2 rounded-xl border transition-all ${selected === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
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
          </ScrollArea>
        </div>

        <div className="lg:col-span-3">
          {!selectedStudent ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Selecione um aluno para ver o caderno</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4 flex justify-between items-center">
                <h3 className="font-bold">{selectedStudent.full_name}</h3>
                <div className="flex gap-2">
                  {SUBJECTS.map(s => (
                    <Button 
                      key={s.name}
                      variant={activeSubject === s.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSubject(activeSubject === s.name ? null : s.name)}
                    >
                      {s.emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {viewingEntry ? (
                <div className="bg-card rounded-xl border p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{viewingEntry.title}</h4>
                      <p className="text-sm text-muted-foreground">{viewingEntry.subject} • {viewingEntry.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setViewEntry(null)}><X className="h-4 w-4" /></Button>
                  </div>

                  <div className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg border">
                    {viewingEntry.content}
                  </div>

                  {viewingEntry.file_urls && viewingEntry.file_urls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {viewingEntry.file_urls.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 border rounded-lg bg-background hover:bg-muted transition-colors"
                        >
                          {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon size={16} /> : <FileIcon size={16} />}
                          <span className="text-[10px] truncate">Anexo {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t">
                    <h5 className="font-semibold text-sm">Feedback do Professor</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input 
                        placeholder="Nota" 
                        value={grade} 
                        onChange={e => setGrade(e.target.value)} 
                        className="md:col-span-1"
                      />
                      <Textarea 
                        placeholder="Comentário pedagógico..." 
                        value={correction} 
                        onChange={e => setCorrection(e.target.value)} 
                        className="md:col-span-3"
                      />
                    </div>
                    <Button onClick={handleCorrection} className="w-full bg-primary hover:bg-primary/90">
                      Enviar Correção e Notificar Aluno
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEntries.map(entry => (
                    <motion.div 
                      key={entry.id} 
                      layoutId={entry.id}
                      className="bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/50 transition-all" 
                      onClick={() => {
                        setViewEntry(entry.id);
                        setGrade(entry.grade || "");
                        setCorrection(entry.teacher_note || "");
                      }}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                          {entry.subject}
                        </span>
                        <Badge variant={entry.status === 'corrigido' ? 'default' : 'outline'} className="text-[9px]">
                          {entry.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm truncate">{entry.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={10} /> {entry.date}
                      </p>
                      {entry.file_urls && entry.file_urls.length > 0 && (
                        <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                          <Link2 size={10} /> {entry.file_urls.length} anexos
                        </p>
                      )}
                    </motion.div>
                  ))}
                  {filteredEntries.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                      <PenLine className="mx-auto h-8 w-8 opacity-20 mb-2" />
                      <p className="text-sm">Nenhuma entrada encontrada para este aluno.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
