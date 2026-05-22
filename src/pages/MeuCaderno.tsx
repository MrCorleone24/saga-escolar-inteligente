import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  PenLine, MessageSquare, Star, ChevronLeft, ChevronRight,
  BookOpen, Camera, Save, RotateCcw, Plus, Check, Clock, Link2,
  FileDown, Search, Filter, History, CheckCircle2, Bell,
  FileUp, Trash2, FileIcon, ImageIcon, X, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  const [isWriting, setIsWriting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [userId, setUserId] = useState<string | null>(null);
  
  // New entry state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });

    if (userId) {
      // Subscribe to personal notifications
      const channel = supabase
        .channel(`user_notifications_${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload) => {
            toast.info(payload.new.title, { description: payload.new.message });
            queryClient.invalidateQueries({ queryKey: ['notebook_entries'] });
          }
        )
        .subscribe();
      return () => { channel.unsubscribe(); };
    }
  }, [userId, queryClient]);

  const { data: entries = [] } = useQuery({
    queryKey: ['notebook_entries', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notebook_entries')
        .select(`*, feedback_versions (*)`)
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
      const matchesSubject = e.subject === subject.name;
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "todos" ? true : e.status === statusFilter;
      return matchesSubject && matchesSearch && matchesStatus;
    });
  }, [entries, subject.name, searchQuery, statusFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('notebook-assets')
        .upload(fileName, file);

      if (error) {
        toast.error(`Erro ao subir arquivo: ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('notebook-assets')
        .getPublicUrl(fileName);
      
      setUploadedUrls(prev => [...prev, publicUrl]);
    }
    setUploading(false);
    toast.success("Arquivos anexados!");
  };

  const handleSaveEntry = async (status: "rascunho" | "enviado") => {
    if (!newTitle || !newContent) {
      toast.error("Preencha o título e o conteúdo");
      return;
    }

    const { error } = await supabase
      .from('notebook_entries')
      .insert({
        student_id: userId,
        subject: subject.name,
        title: newTitle,
        content: newContent,
        status: status,
        date: new Date().toLocaleDateString('pt-BR'),
        file_urls: uploadedUrls
      } as any);


    if (error) {
      toast.error("Erro ao salvar atividade");
      return;
    }

    toast.success(status === "enviado" ? "Atividade enviada!" : "Rascunho salvo!");
    setIsWriting(false);
    setNewTitle("");
    setNewContent("");
    setUploadedUrls([]);
    queryClient.invalidateQueries({ queryKey: ['notebook_entries'] });
  };

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

    // Optional: Notify teacher back? Or teacher just sees it in their dashboard via Realtime.
    // The teacher dashboard already has a listener for this.

    queryClient.invalidateQueries({ queryKey: ['notebook_entries'] });
    toast.success("Feedback confirmado com sucesso!");
  };

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 font-serif text-primary">
            <PenLine className="text-primary" size={28} /> Meu Caderno Real
          </h1>
          <p className="text-sm text-muted-foreground italic">Escreva e personalize suas matérias como um caderno real</p>
        </div>
        <Button onClick={() => setIsWriting(!isWriting)} variant={isWriting ? "ghost" : "default"} className="rounded-full shadow-lg">
          {isWriting ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isWriting ? "Fechar Caderno" : "Nova Folha"}
        </Button>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {SUBJECTS.map((s, i) => {
          const count = entries.filter(e => e.subject === s.name).length;
          return (
            <motion.button
              key={s.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveSubject(i); setIsWriting(false); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
                activeSubject === i
                  ? "text-primary-foreground shadow-lg"
                  : "bg-card text-muted-foreground border-border hover:border-primary/20"
              }`}
              style={activeSubject === i ? { backgroundColor: `hsl(${s.color})`, borderColor: `hsl(${s.color})` } : {}}
            >
              {s.emoji} {s.name} {count > 0 && <span className="bg-white/20 rounded-full px-2 py-0.5 text-[10px]">{count}</span>}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {isWriting ? (
          <motion.div
            key="writing-panel"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            className="bg-[#fffdfa] border-l-[30px] rounded-r-2xl p-8 shadow-2xl min-h-[700px] relative overflow-hidden"
            style={{ 
              borderColor: `hsl(${subject.color})`,
              backgroundImage: `
                linear-gradient(90deg, rgba(255,0,0,0.1) 0px, rgba(255,0,0,0.1) 1px, transparent 1px),
                linear-gradient(#e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 100% 1.6rem',
              backgroundPosition: '40px 0, 0 1.2rem',
              lineHeight: '1.6rem'
            }}
          >
            {/* Spiral binding simulation */}
            <div className="absolute left-0 top-0 bottom-0 w-[30px] flex flex-col items-center justify-around py-4 z-20">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-inner" />
              ))}
            </div>
            <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-200/50" />

            <div className="space-y-6 relative z-10">
              <Input 
                placeholder="Título da Atividade..." 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)}
                className="text-2xl font-serif font-bold border-none focus-visible:ring-0 px-8 h-auto bg-transparent text-gray-800"
              />
              <Textarea 
                placeholder="Escreva aqui sua lição ou pensamento..." 
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="min-h-[400px] border-none focus-visible:ring-0 px-8 text-lg font-serif resize-none bg-transparent text-gray-700 placeholder:italic"
                style={{ lineHeight: '1.5rem', paddingTop: '0.25rem' }}
              />
              
              <div className="flex flex-wrap gap-2">
                {uploadedUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border w-20 h-20 bg-muted">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={url} alt="Upload" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><FileIcon className="text-muted-foreground" /></div>
                    )}
                    <button 
                      onClick={() => setUploadedUrls(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? <Clock className="animate-spin text-primary" /> : <FileUp className="text-muted-foreground" />}
                  <span className="text-[10px] mt-1 font-medium">{uploading ? "Subindo..." : "Anexar"}</span>
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => handleSaveEntry('rascunho')}>Salvar Rascunho</Button>
                <Button onClick={() => handleSaveEntry('enviado')} className="bg-primary hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" /> Enviar para Professor
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((entry, i) => {
              const status = STATUS_CONFIG[entry.status];
              return (
                <motion.div
                  key={entry.id}
                  layoutId={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-5 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-xl ${status.bg} ${status.color}`}>
                        <status.icon size={18} />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                        {status.label}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{entry.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-3">{entry.content}</p>
                    
                    <div className="mt-auto space-y-4">
                      {entry.teacher_note && (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Feedback do Professor</p>
                          <p className="text-xs text-emerald-900">{entry.teacher_note}</p>

                          {entry.grade && <p className="text-sm font-bold mt-1">Nota: {entry.grade}</p>}
                          {entry.status === 'corrigido' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleConfirmReading(entry.id)}
                              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Confirmar Leitura
                            </Button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t">
                        <span className="flex items-center gap-1"><Clock size={12} /> {entry.date}</span>
                        {entry.file_urls && entry.file_urls.length > 0 && (
                          <span className="flex items-center gap-1"><Link2 size={12} /> {entry.file_urls.length} anexos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl bg-muted/20">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="font-medium">Nenhum registro em {subject.name}</p>
                <p className="text-sm">Clique em "Nova Atividade" para começar.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
