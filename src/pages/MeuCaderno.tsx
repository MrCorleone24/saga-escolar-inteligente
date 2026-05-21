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
import { SUBJECTS, LessonLink, NotebookEntry, FeedbackVersion } from "@/lib/subjects";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [newContent, setNewContent] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"notebook" | "list">("notebook");
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: entries = [], isLoading } = useQuery({
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
      return data.map(e => ({
        ...e,
        versions: e.feedback_versions
      })) as NotebookEntry[];
    },
    enabled: !!userId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*');
      if (error) throw error;
      return data as LessonLink[];
    }
  });

  const subject = SUBJECTS[activeSubject];
  
  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchesSubject = viewMode === "notebook" ? e.subject === subject.name : true;
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.subject.toLowerCase().includes(searchQuery.toLowerCase());
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


  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Histórico de Notas e Feedbacks", 20, 20);
    doc.setFontSize(12);
    doc.text(`Aluno: João Silva | Data: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let y = 45;
    entries.filter(e => e.status === "corrigido" || e.status === "confirmado").forEach((e, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${e.date} - ${e.subject}: ${e.title}`, 20, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`Nota: ${e.grade || "S/N"}`, 25, y);
      y += 7;
      doc.text(`Feedback: ${e.teacherNote || "S/C"}`, 25, y);
      y += 7;
      if (e.status === "confirmado") {
        doc.text(`[✓ Confirmado em ${e.confirmedAt}]`, 25, y);
        y += 7;
      }
      y += 5;
      doc.line(20, y, 190, y);
      y += 10;
    });

    doc.save("historico-notas.pdf");
    toast.success("PDF exportado com sucesso!");
  };


  const subjectLessons = MOCK_LESSONS.filter(l => l.subject === subject.name);

  const flipPage = (direction: "next" | "prev") => {
    if (isFlipping) return;
    const maxPage = isWriting ? filtered.length : filtered.length - 1;
    if (direction === "next" && currentPage >= maxPage) return;
    if (direction === "prev" && currentPage <= 0) return;
    setFlipDirection(direction);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(p => direction === "next" ? p + 1 : p - 1);
      setIsFlipping(false);
    }, 400);
  };

  const goToNewPage = () => {
    setIsWriting(true);
    setCurrentPage(filtered.length);
    setNewContent("");
    setNewTitle("");
    setNewPhoto(null);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const subjectColor = `hsl(${subject.color})`;

  // Get linked lesson for current entry
  const linkedLesson = currentEntry?.lessonId ? MOCK_LESSONS.find(l => l.id === currentEntry.lessonId) : null;

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PenLine className="text-primary" size={24} /> Meu Caderno Digital
        </h1>
        <p className="text-muted-foreground text-sm">Seu caderno escolar completo, organizado por matéria</p>
      </motion.div>

      {/* Subject quick-nav tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {SUBJECTS.map((s, i) => {
          const count = MOCK_ENTRIES.filter(e => e.subject === s.name).length;
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
              <span className="text-base">{s.emoji}</span>
              {s.name}
              {activeSubject === i && count > 0 && (
                <span className="bg-white/20 rounded-full px-1.5 text-[10px]">{count}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Linked lessons bar */}
      {subjectLessons.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 bg-card rounded-xl border border-border p-3">
          <p className="text-[10px] font-bold text-muted-foreground mb-2 flex items-center gap-1"><Link2 size={10} /> Aulas vinculadas de {subject.name}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {subjectLessons.map(l => (
              <button
                key={l.id}
                onClick={() => navigate(`/aula/${l.id}`)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-border hover:border-primary/30 bg-background shrink-0 transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${l.status === "concluída" ? "bg-emerald-500" : l.status === "em andamento" ? "bg-primary" : "bg-muted-foreground"}`} />
                {l.title}
                <span className="text-muted-foreground">{l.date}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* View toggle + Search + Filters + PDF */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("notebook")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${viewMode === "notebook" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            📓 Caderno
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            📋 Lista Histórica
          </button>
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[150px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Buscar por título ou matéria..." 
              className="pl-9 h-9 text-xs" 
            />
          </div>
          
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2 h-9 shadow-sm">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-xs focus:ring-0 cursor-pointer pr-6"
            >
              <option value="todos">Todos Status</option>
              <option value="enviado">Enviados</option>
              <option value="corrigido">Corrigidos</option>
              <option value="confirmado">Confirmados</option>
              <option value="devolvido">Devolvidos</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToPDF}
            className="h-9 gap-2 text-xs border-primary/30 text-primary hover:bg-primary/5 shadow-sm"
          >
            <FileDown size={14} /> Exportar PDF
          </Button>

          <Button size="sm" onClick={goToNewPage} className="h-9 gradient-hero border-0 text-primary-foreground gap-1.5 shadow-md">
            <Plus size={14} /> Nova Página
          </Button>
        </div>
      </div>

      {viewMode === "notebook" ? (
        <div className="flex flex-col items-center" style={{ perspective: "1500px" }}>
          <div className="relative w-full max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ transformStyle: "preserve-3d", transform: "rotateX(2deg)", minHeight: 520 }}>
              {/* Notebook spine */}
              <div className="absolute left-0 top-0 bottom-0 w-12 z-20 rounded-l-2xl" style={{ background: `linear-gradient(90deg, hsl(${subject.color} / 0.9), hsl(${subject.color} / 0.7))`, boxShadow: "inset -4px 0 8px rgba(0,0,0,0.15)" }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute left-1/2 -translate-x-1/2 w-6 h-3 rounded-full border-2" style={{ top: `${12 + i * 11}%`, borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.1)" }} />
                ))}
              </div>

              <div className="ml-12 relative" style={{ minHeight: 520 }}>
                <div className="absolute inset-0 bg-amber-50/80 rounded-r-xl border border-border" style={{ transform: "translateX(4px) translateY(4px)" }} />
                <div className="absolute inset-0 bg-amber-50/90 rounded-r-xl border border-border" style={{ transform: "translateX(2px) translateY(2px)" }} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${subject.name}-${currentPage}-${isWriting}`}
                    initial={{ rotateY: flipDirection === "next" ? 90 : -90, opacity: 0, originX: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: flipDirection === "next" ? -90 : 90, opacity: 0, originX: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative rounded-r-xl border border-border overflow-hidden"
                    style={{ background: "linear-gradient(180deg, #fefcf3 0%, #fdf6e3 100%)", minHeight: 520, transformStyle: "preserve-3d" }}
                  >
                    {/* Notebook lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300/40" />
                      {[...Array(22)].map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 h-px" style={{ top: `${60 + i * 22}px`, background: "rgba(100, 149, 237, 0.15)" }} />
                      ))}
                    </div>

                    {/* Page header */}
                    <div className="relative z-10 px-6 pt-4 pb-3 border-b" style={{ borderColor: `hsl(${subject.color} / 0.15)` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{subject.emoji}</span>
                          <div>
                            <h3 className="font-bold text-sm" style={{ color: subjectColor }}>{subject.name}</h3>
                            <p className="text-[10px] text-muted-foreground">
                              {isWriting && currentPage >= filtered.length
                                ? "27/02/2026 · Nova página"
                                : currentEntry?.date}
                              {currentEntry?.lessonRef && ` · ${currentEntry.lessonRef}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {linkedLesson && !isWriting && (
                            <button
                              onClick={() => navigate(`/aula/${linkedLesson.id}`)}
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Link2 size={10} /> Ver aula
                            </button>
                          )}
                          {currentEntry && !isWriting && (
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_CONFIG[currentEntry.status].bg} ${STATUS_CONFIG[currentEntry.status].color}`}>
                              {(() => { const Icon = STATUS_CONFIG[currentEntry.status].icon; return <Icon size={10} />; })()}
                              {STATUS_CONFIG[currentEntry.status].label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Page content */}
                    <div className="relative z-10 px-6 py-4" style={{ paddingLeft: "4.5rem", minHeight: 400 }}>
                      {isWriting && currentPage >= filtered.length ? (
                        <div className="space-y-3">
                          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título da página..." className="border-0 border-b-2 rounded-none bg-transparent font-bold text-base px-0 focus-visible:ring-0" style={{ borderColor: `hsl(${subject.color} / 0.3)` }} />
                          {/* Link to lesson selector */}
                          <select className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                            <option value="">🔗 Vincular a uma aula (opcional)</option>
                            {subjectLessons.map(l => (
                              <option key={l.id} value={l.id}>{l.date} - {l.title}</option>
                            ))}
                          </select>
                          <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Escreva aqui o que aprendeu hoje... ✏️" rows={10} className="border-0 bg-transparent resize-none px-0 text-sm leading-[22px] focus-visible:ring-0" />
                          <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed hover:border-primary/50 cursor-pointer transition-colors" style={{ borderColor: `hsl(${subject.color} / 0.3)` }}>
                            <Camera size={16} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{newPhoto ? "📷 Foto adicionada ✓" : "Tirar foto ou anexar imagem do caderno físico"}</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                          </label>
                          {newPhoto && <img src={newPhoto} alt="Preview" className="rounded-lg border max-h-40 object-cover w-full" />}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="gradient-hero border-0 text-primary-foreground gap-1.5 flex-1">
                              <Save size={14} /> Salvar Página
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setIsWriting(false); setCurrentPage(Math.max(0, filtered.length - 1)); }}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : currentEntry ? (
                        <div>
                          <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: subjectColor }}>
                            {currentEntry.title}
                            {currentEntry.grade && (
                              <span className="flex items-center gap-1 text-xs font-bold ml-auto" style={{ color: subjectColor }}>
                                <Star size={12} /> {currentEntry.grade}
                              </span>
                            )}
                          </h2>
                          <div className="text-sm leading-[22px] whitespace-pre-wrap text-foreground/90">{currentEntry.content}</div>
                          {currentEntry.photo && (
                            <div className="mt-4">
                              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">📷 Foto do caderno:</p>
                              <img src={currentEntry.photo} alt="Caderno físico" className="rounded-lg border max-h-48 object-cover" />
                            </div>
                          )}
                          {currentEntry.teacherNote && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ delay: 0.3 }} 
                              className="mt-5 rounded-xl p-4 border relative overflow-hidden" 
                              style={{ background: `hsl(${subject.color} / 0.05)`, borderColor: `hsl(${subject.color} / 0.15)` }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare size={12} style={{ color: subjectColor }} />
                                  <span className="text-xs font-bold" style={{ color: subjectColor }}>Feedback da Professora</span>
                                </div>
                                {currentEntry.versions && currentEntry.versions.length > 0 && (
                                  <button 
                                    onClick={() => setShowVersionHistory(showVersionHistory === currentEntry.id ? null : currentEntry.id)}
                                    className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                  >
                                    <History size={10} /> {showVersionHistory === currentEntry.id ? "Ocultar Histórico" : "Ver Histórico"}
                                  </button>
                                )}
                              </div>

                              {showVersionHistory === currentEntry.id && currentEntry.versions && (
                                <div className="mb-3 space-y-2 border-l-2 border-primary/20 pl-3 py-1">
                                  {currentEntry.versions.map(v => (
                                    <div key={v.id} className="text-[10px]">
                                      <p className="font-bold text-muted-foreground">{v.date} · {v.grade}</p>
                                      <p className="text-muted-foreground italic">"{v.note}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{currentEntry.teacherNote}</p>
                              
                              <div className="flex justify-between items-center pt-2 border-t border-border/30">
                                {currentEntry.status === "confirmado" ? (
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    <CheckCircle2 size={12} /> Confirmado em {currentEntry.confirmedAt}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                      <Bell size={10} /> Confirme a leitura
                                    </span>
                                    <Button 
                                      size="sm" 
                                      className="h-8 text-[10px] gap-1.5 px-3 gradient-hero border-0 text-white"
                                      onClick={() => handleConfirmReading(currentEntry.id)}
                                    >
                                      <CheckCircle2 size={12} /> Confirmar Leitura
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                          <p className="font-medium text-sm">Caderno vazio em {subject.name}</p>
                          <p className="text-xs">Clique em "Nova Página" para começar!</p>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/50 font-medium">
                      Página {currentPage + 1} de {isWriting ? filtered.length + 1 : Math.max(filtered.length, 1)}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => flipPage("prev")} disabled={currentPage <= 0} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={18} />
              </motion.button>
              <div className="flex items-center gap-1.5">
                {filtered.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentPage(i); setIsWriting(false); }} className="rounded-full transition-all" style={{ width: currentPage === i ? 24 : 8, height: 8, backgroundColor: currentPage === i ? subjectColor : `hsl(${subject.color} / 0.25)` }} />
                ))}
                {isWriting && <div className="w-6 h-2 rounded-full animate-pulse" style={{ backgroundColor: subjectColor }} />}
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => flipPage("next")} disabled={currentPage >= (isWriting ? filtered.length : filtered.length - 1)} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Nenhuma entrada em {subject.name}</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setViewMode("notebook"); setCurrentPage(i); setIsWriting(false); }}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-lg font-bold bg-muted text-muted-foreground">{entry.subject}</span>
                      {entry.lessonId && (
                        <span className="text-[10px] text-primary flex items-center gap-0.5"><Link2 size={8} /> Aula</span>
                      )}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[entry.status]?.bg || "bg-muted"} ${STATUS_CONFIG[entry.status]?.color || "text-muted-foreground"}`}>
                        {STATUS_CONFIG[entry.status]?.label || entry.status}
                      </div>
                    </div>
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{entry.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                  </div>
                  {entry.grade && (
                    <span className="flex items-center gap-1 text-xs font-bold shrink-0" style={{ color: subjectColor }}>
                      <Star size={12} /> {entry.grade}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
