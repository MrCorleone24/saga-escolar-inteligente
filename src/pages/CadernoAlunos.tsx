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
import { SUBJECTS, MOCK_LESSONS, NotebookEntry, FeedbackVersion } from "@/lib/subjects";
import { toast } from "sonner";

const STUDENTS = [
  { id: 1, name: "João Silva", grade: "3º A", avatar: "J", entries: 12, pending: 2 },
  { id: 2, name: "Maria Oliveira", grade: "3º A", avatar: "M", entries: 15, pending: 0 },
  { id: 3, name: "Pedro Santos", grade: "3º A", avatar: "P", entries: 8, pending: 4 },
  { id: 4, name: "Ana Costa", grade: "3º B", avatar: "A", entries: 14, pending: 1 },
  { id: 5, name: "Lucas Ferreira", grade: "3º B", avatar: "L", entries: 10, pending: 3 },
];

const INITIAL_ENTRIES: NotebookEntry[] = [
  { 
    id: 1, date: "27/02/2026", subject: "Português", title: "Texto Narrativo - A Formiguinha", 
    content: "Hoje aprendemos sobre texto narrativo. A professora pediu para copiar o texto da formiguinha e a neve.", 
    photo: null, status: "enviado", lessonId: "1" 
  },
  { 
    id: 2, date: "26/02/2026", subject: "Matemática", title: "Tabuada do 3 e 4", 
    content: "Exercícios de multiplicação por 3 e 4.", 
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop", 
    status: "enviado", lessonId: "4" 
  },
  { 
    id: 3, date: "25/02/2026", subject: "Ciências", title: "Ciclo da Água", 
    content: "Desenho do ciclo da água.", 
    photo: null, status: "confirmado", lessonId: "8", grade: "Muito Bem!", 
    teacherNote: "Excelente desenho!", confirmedAt: "26/02/2026 14:20",
    versions: [
      { id: "v1", date: "25/02/2026 16:00", grade: "Bom", note: "Pode melhorar os detalhes.", status: "corrigido" }
    ]
  },
  { id: 4, date: "27/02/2026", subject: "Tecnologia e IA", title: "Pensamento Computacional", content: "Aprendemos o que é um algoritmo.", photo: null, status: "enviado", lessonId: "17" },
  { id: 5, date: "26/02/2026", subject: "Espanhol", title: "Saludos y Presentaciones", content: "Hola, me llamo João.", photo: null, status: "enviado", lessonId: "13" },
  { id: 6, date: "25/02/2026", subject: "Leitura/Literatura", title: "O Pequeno Príncipe - Cap 1", content: "Li o primeiro capítulo e fiz reflexão.", photo: null, status: "corrigido", lessonId: "19", grade: "Lindo! 📚", teacherNote: "Ótima reflexão!" },
];

export default function CadernoAlunos() {
  const [entries, setEntries] = useState<NotebookEntry[]>(INITIAL_ENTRIES);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [correction, setCorrection] = useState("");
  const [grade, setGrade] = useState("");
  const [viewEntry, setViewEntry] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const filteredStudents = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const selectedStudent = STUDENTS.find(s => s.id === selected);

  const filteredEntries = activeSubject
    ? entries.filter(e => e.subject === activeSubject)
    : entries;

  const viewingEntry = entries.find(e => e.id === viewEntry);

  const handleCorrection = () => {
    if (!viewingEntry) return;

    const newVersion: FeedbackVersion = {
      id: `v${Date.now()}`,
      date: new Date().toLocaleString(),
      grade: viewingEntry.grade || "Sem nota",
      note: viewingEntry.teacherNote || "Sem comentário",
      status: viewingEntry.status as any
    };

    const updatedEntries = entries.map(e => {
      if (e.id === viewingEntry.id) {
        return {
          ...e,
          status: "corrigido",
          grade: grade,
          teacherNote: correction,
          versions: [...(e.versions || []), newVersion]
        } as NotebookEntry;
      }
      return e;
    });

    setEntries(updatedEntries);
    setViewEntry(null);
    setGrade("");
    setCorrection("");
    toast.success("Correção enviada com sucesso!");
    
    // Simulate notification to student
    setTimeout(() => {
      console.log("Notification sent to student: Your notebook has been corrected again.");
    }, 1000);
  };

  const handleReopen = () => {
    if (!viewingEntry) return;
    setGrade(viewingEntry.grade || "");
    setCorrection(viewingEntry.teacherNote || "");
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
        {/* Student list */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="pl-9" />
          </div>
          {filteredStudents.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => { setSelected(s.id); setViewEntry(null); }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === s.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-sm">{s.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.grade} · {s.entries} entradas</p>
                </div>
                {s.pending > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gamification-gold/10 text-gamification-gold font-bold">{s.pending}</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Student notebook */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Selecione um aluno</p>
              <p className="text-xs">Clique no nome do aluno para ver o caderno</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-sm">{selectedStudent.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedStudent.grade} · {selectedStudent.entries} entradas · {selectedStudent.pending} pendentes</p>
              </div>

              {/* Subject filter for entries */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveSubject(null)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${!activeSubject ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  Todas
                </button>
                {SUBJECTS.map(s => {
                  const count = entries.filter(e => e.subject === s.name).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={s.name}
                      onClick={() => setActiveSubject(s.name)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                        activeSubject === s.name ? "text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      style={activeSubject === s.name ? { backgroundColor: `hsl(${s.color})` } : {}}
                    >
                      {s.emoji} {s.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Entry detail view */}
              {viewingEntry && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border-2 border-primary/20 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-bold text-sm">{viewingEntry.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{viewingEntry.date} · {viewingEntry.subject}</p>
                      </div>
                      {viewingEntry.status === "confirmado" && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          <CheckCircle size={10} /> Confirmado
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {viewingEntry.versions && viewingEntry.versions.length > 0 && (
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setShowHistory(!showHistory)} title="Ver histórico de correções">
                          <History size={14} />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => { setViewEntry(null); setShowHistory(false); }}>✕</Button>
                    </div>
                  </div>

                  {showHistory && viewingEntry.versions && (
                    <div className="mb-4 bg-muted/50 rounded-lg p-3 border border-border space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <History size={10} /> Histórico de Correções
                      </p>
                      {viewingEntry.versions.map((v, idx) => (
                        <div key={v.id} className="text-[11px] border-l-2 border-primary/30 pl-3 py-1">
                          <div className="flex justify-between items-start">
                            <span className="font-bold">{v.date}</span>
                            <span className="bg-primary/10 text-primary px-1.5 rounded">{v.grade}</span>
                          </div>
                          <p className="text-muted-foreground">{v.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm whitespace-pre-wrap bg-amber-50/50 rounded-lg p-4 border border-border mb-3" style={{ fontFamily: "serif" }}>
                    {viewingEntry.content}
                  </div>
                  {viewingEntry.photo && <img src={viewingEntry.photo} alt="Caderno" className="rounded-lg border max-h-48 object-cover mb-3" />}
                  {viewingEntry.lessonId && (
                    <p className="text-[10px] text-primary flex items-center gap-1 mb-3">
                      <Link2 size={10} />
                      Vinculado à aula: {MOCK_LESSONS.find(l => l.id === viewingEntry.lessonId)?.title || "Aula"}
                    </p>
                  )}

                  {/* Correction Area */}
                  {(viewingEntry.status === "enviado" || viewingEntry.status === "pendente" || correction !== "") ? (
                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Área de Correção</label>
                        {viewingEntry.status === "corrigido" && (
                          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                            <AlertCircle size={10} /> Editando correção anterior
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Nota/Avaliação" value={grade} onChange={e => setGrade(e.target.value)} className="w-32" />
                        <Textarea placeholder="Comentário para o aluno..." value={correction} onChange={e => setCorrection(e.target.value)} rows={2} className="flex-1" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="gradient-hero border-0 text-primary-foreground"
                          onClick={handleCorrection}
                        >
                          <CheckCircle2 size={12} className="mr-1" /> {viewingEntry.status === "corrigido" ? "Atualizar Correção" : "Corrigir e Enviar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setGrade(""); setCorrection(""); }}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700 uppercase">✓ Feedback Atual</p>
                          <p className="text-sm font-bold text-emerald-800">{viewingEntry.grade}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={handleReopen}>
                          <RotateCcw size={10} className="mr-1" /> Reabrir/Atualizar
                        </Button>
                      </div>
                      <p className="text-xs text-emerald-600 italic">"{viewingEntry.teacherNote}"</p>
                      {viewingEntry.confirmedAt && (
                        <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700">
                          <span className="flex items-center gap-1"><Bell size={10} /> Aluno confirmou leitura</span>
                          <span>{viewingEntry.confirmedAt}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Entries list */}
              {filteredEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${viewEntry === entry.id ? "border-primary" : "border-border"}`}
                  onClick={() => setViewEntry(entry.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{SUBJECTS.find(s => s.name === entry.subject)?.emoji}</span>
                      <span className="text-xs font-medium">{entry.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{entry.subject}</span>
                      {entry.lessonId && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Link2 size={8} /> Aula vinculada</span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${entry.status === "corrigido" ? "bg-secondary/10 text-secondary" : "bg-gamification-gold/10 text-gamification-gold"}`}>
                      {entry.status === "corrigido" ? "✓ Corrigido" : "⏳ Pendente"}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-1">{entry.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
                  {entry.photo && <img src={entry.photo} alt="Caderno" className="rounded-lg border border-border max-h-20 object-cover mt-2" />}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
