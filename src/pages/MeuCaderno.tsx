import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  PenLine, Upload, MessageSquare, Star, ChevronLeft, ChevronRight,
  BookOpen, Camera, Eraser, Type, Palette, Save, RotateCcw,
  Calendar, Search, Plus, Check, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const SUBJECTS = [
  { name: "Português", color: "217 91% 50%", emoji: "📖" },
  { name: "Matemática", color: "152 60% 42%", emoji: "🔢" },
  { name: "Ciências", color: "280 65% 55%", emoji: "🔬" },
  { name: "História", color: "38 92% 55%", emoji: "🏛️" },
  { name: "Geografia", color: "170 60% 45%", emoji: "🌍" },
  { name: "Inglês", color: "0 84% 60%", emoji: "🇺🇸" },
  { name: "Artes", color: "310 60% 50%", emoji: "🎨" },
];

interface NotebookEntry {
  id: number;
  date: string;
  subject: string;
  title: string;
  content: string;
  photo: string | null;
  status: "rascunho" | "enviado" | "corrigido" | "devolvido" | "pendente";
  grade?: string;
  teacherNote?: string;
  lessonRef?: string;
}

const MOCK_ENTRIES: NotebookEntry[] = [
  {
    id: 1, date: "27/02/2026", subject: "Português", title: "Texto Narrativo - A Formiguinha e a Neve",
    content: "Hoje aprendemos sobre texto narrativo. A professora pediu para copiar o texto da formiguinha e a neve.\n\nEra uma vez uma formiguinha que trabalhava o dia inteiro, sem parar. No inverno, quando a neve caiu, ela já tinha comida guardada.\n\nRespondi as perguntas:\n1. Quem é o personagem principal? A formiguinha.\n2. Onde se passa a história? Na floresta.\n3. Qual a moral da história? Devemos nos preparar para o futuro.",
    photo: null, status: "corrigido", grade: "Muito Bem! ⭐",
    teacherNote: "Excelente trabalho, João! Suas respostas estão completas e bem escritas. Continue assim!",
    lessonRef: "Aula 12 - Interpretação de Texto",
  },
  {
    id: 2, date: "26/02/2026", subject: "Português", title: "Ditado - Palavras com LH e NH",
    content: "Ditado de palavras:\n\nTrabalho, espelho, abelha, orelha, toalha, milho, filha, galho.\n\nNinho, minha, rainha, vizinha, linha, sonho, banho, cozinha.",
    photo: null, status: "corrigido", grade: "Bom! 👍",
    teacherNote: "Muito bem! Apenas 'vizinha' estava com erro. Corrija e pratique.",
  },
  {
    id: 3, date: "27/02/2026", subject: "Matemática", title: "Tabuada do 3 e do 4",
    content: "Exercícios de multiplicação:\n\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n\n4 x 1 = 4\n4 x 2 = 8\n4 x 3 = 12\n4 x 4 = 16\n4 x 5 = 20\n\nProblemas:\n1. Maria tem 3 cestas com 4 maçãs cada. Quantas maçãs ela tem? 3 x 4 = 12 maçãs.\n2. João comprou 4 pacotes com 3 figurinhas. Quantas figurinhas? 4 x 3 = 12 figurinhas.",
    photo: null, status: "pendente", grade: undefined, teacherNote: undefined,
    lessonRef: "Aula 15 - Multiplicação",
  },
  {
    id: 4, date: "25/02/2026", subject: "Ciências", title: "Ciclo da Água - Desenho",
    content: "Fiz o desenho do ciclo da água mostrando:\n- Evaporação (sol aquecendo a água)\n- Condensação (nuvens se formando)\n- Precipitação (chuva caindo)\n- Infiltração (água entrando no solo)",
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    status: "corrigido", grade: "Bom trabalho! 🌊",
    teacherNote: "O desenho ficou muito bom! Faltou indicar a transpiração das plantas. Veja a correção.",
  },
  {
    id: 5, date: "24/02/2026", subject: "História", title: "Os Povos Indígenas do Brasil",
    content: "Os povos indígenas foram os primeiros habitantes do Brasil. Eles já viviam aqui muito antes dos portugueses chegarem em 1500.\n\nCulturas importantes:\n- Tupi-Guarani: viviam no litoral\n- Yanomami: viviam na Amazônia\n- Xavante: viviam no cerrado\n\nOs indígenas nos ensinaram muitas coisas como o uso da mandioca, redes para dormir e nomes de lugares (Itapuã, Guanabara, Pará).",
    photo: null, status: "enviado", grade: undefined, teacherNote: undefined,
    lessonRef: "Aula 8 - Brasil Indígena",
  },
  {
    id: 6, date: "26/02/2026", subject: "Matemática", title: "Problemas de Adição e Subtração",
    content: "1. Pedro tinha 45 bolinhas e ganhou mais 23. Quantas bolinhas ele tem agora?\n45 + 23 = 68 bolinhas\n\n2. Ana tinha 80 reais e gastou 35 em um livro. Quanto sobrou?\n80 - 35 = 45 reais\n\n3. Na escola há 120 alunos. Se 48 foram para a biblioteca, quantos ficaram na sala?\n120 - 48 = 72 alunos",
    photo: null, status: "corrigido", grade: "Perfeito! 🌟",
    teacherNote: "Todos os problemas corretos! Parabéns pela organização das contas.",
  },
];

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", icon: PenLine, color: "text-muted-foreground", bg: "bg-muted" },
  enviado: { label: "Enviado", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  pendente: { label: "Pendente", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  corrigido: { label: "Corrigido", icon: Check, color: "text-emerald-600", bg: "bg-emerald-50" },
  devolvido: { label: "Devolvido", icon: RotateCcw, color: "text-red-500", bg: "bg-red-50" },
};

export default function MeuCaderno() {
  const [activeSubject, setActiveSubject] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [isWriting, setIsWriting] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"notebook" | "list">("notebook");

  const subject = SUBJECTS[activeSubject];
  const filtered = MOCK_ENTRIES.filter(e => e.subject === subject.name);
  const currentEntry = filtered[currentPage] || null;

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
        {SUBJECTS.map((s, i) => (
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
            {activeSubject === i && (
              <span className="bg-white/20 rounded-full px-1.5 text-[10px]">
                {MOCK_ENTRIES.filter(e => e.subject === s.name).length}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* View toggle + new page */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("notebook")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "notebook" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            📓 Caderno
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            📋 Lista
          </button>
        </div>
        <Button size="sm" onClick={goToNewPage} className="gradient-hero border-0 text-primary-foreground gap-1.5">
          <Plus size={14} /> Nova Página
        </Button>
      </div>

      {viewMode === "notebook" ? (
        /* ============ 3D NOTEBOOK VIEW ============ */
        <div className="flex flex-col items-center" style={{ perspective: "1500px" }}>
          {/* Notebook container */}
          <div className="relative w-full max-w-3xl">
            {/* Notebook body - 3D effect */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateX(2deg)",
                minHeight: 520,
              }}
            >
              {/* Notebook spine */}
              <div
                className="absolute left-0 top-0 bottom-0 w-12 z-20 rounded-l-2xl"
                style={{
                  background: `linear-gradient(90deg, hsl(${subject.color} / 0.9), hsl(${subject.color} / 0.7))`,
                  boxShadow: "inset -4px 0 8px rgba(0,0,0,0.15)",
                }}
              >
                {/* Spine rings */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 -translate-x-1/2 w-6 h-3 rounded-full border-2"
                    style={{
                      top: `${12 + i * 11}%`,
                      borderColor: "rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>

              {/* Page area */}
              <div className="ml-12 relative" style={{ minHeight: 520 }}>
                {/* Stacked pages behind effect */}
                <div className="absolute inset-0 bg-amber-50/80 rounded-r-xl border border-border" style={{ transform: "translateX(4px) translateY(4px)" }} />
                <div className="absolute inset-0 bg-amber-50/90 rounded-r-xl border border-border" style={{ transform: "translateX(2px) translateY(2px)" }} />

                {/* Current page */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${subject.name}-${currentPage}-${isWriting}`}
                    initial={{
                      rotateY: flipDirection === "next" ? 90 : -90,
                      opacity: 0,
                      originX: 0,
                    }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{
                      rotateY: flipDirection === "next" ? -90 : 90,
                      opacity: 0,
                      originX: 0,
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative rounded-r-xl border border-border overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, #fefcf3 0%, #fdf6e3 100%)",
                      minHeight: 520,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Notebook lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Red margin line */}
                      <div className="absolute left-16 top-0 bottom-0 w-px bg-red-300/40" />
                      {/* Blue horizontal lines */}
                      {[...Array(22)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 h-px"
                          style={{
                            top: `${60 + i * 22}px`,
                            background: "rgba(100, 149, 237, 0.15)",
                          }}
                        />
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
                        {currentEntry && !isWriting && (
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_CONFIG[currentEntry.status].bg} ${STATUS_CONFIG[currentEntry.status].color}`}>
                            {(() => { const Icon = STATUS_CONFIG[currentEntry.status].icon; return <Icon size={10} />; })()}
                            {STATUS_CONFIG[currentEntry.status].label}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page content */}
                    <div className="relative z-10 px-6 py-4" style={{ paddingLeft: "4.5rem", minHeight: 400 }}>
                      {isWriting && currentPage >= filtered.length ? (
                        /* New entry form */
                        <div className="space-y-3">
                          <Input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Título da página..."
                            className="border-0 border-b-2 rounded-none bg-transparent font-bold text-base px-0 focus-visible:ring-0"
                            style={{ borderColor: `hsl(${subject.color} / 0.3)` }}
                          />
                          <Textarea
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            placeholder="Escreva aqui o que aprendeu hoje... ✏️"
                            rows={12}
                            className="border-0 bg-transparent resize-none px-0 text-sm leading-[22px] focus-visible:ring-0"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          />
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
                        /* Existing entry */
                        <div>
                          <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: subjectColor }}>
                            {currentEntry.title}
                            {currentEntry.grade && (
                              <span className="flex items-center gap-1 text-xs font-bold ml-auto" style={{ color: `hsl(${SUBJECTS.find(s => s.name === currentEntry.subject)?.color || "152 60% 42%"})` }}>
                                <Star size={12} /> {currentEntry.grade}
                              </span>
                            )}
                          </h2>
                          <div className="text-sm leading-[22px] whitespace-pre-wrap text-foreground/90">
                            {currentEntry.content}
                          </div>
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
                              className="mt-5 rounded-xl p-4 border"
                              style={{
                                background: `hsl(${subject.color} / 0.05)`,
                                borderColor: `hsl(${subject.color} / 0.15)`,
                              }}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <MessageSquare size={12} style={{ color: subjectColor }} />
                                <span className="text-xs font-bold" style={{ color: subjectColor }}>Correção da Professora</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{currentEntry.teacherNote}</p>
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

                    {/* Page number */}
                    <div className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/50 font-medium">
                      Página {currentPage + 1} de {isWriting ? filtered.length + 1 : Math.max(filtered.length, 1)}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => flipPage("prev")}
                disabled={currentPage <= 0}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </motion.button>

              {/* Page dots */}
              <div className="flex items-center gap-1.5">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i); setIsWriting(false); }}
                    className={`rounded-full transition-all ${
                      currentPage === i ? "w-6 h-2" : "w-2 h-2 hover:scale-125"
                    }`}
                    style={{
                      backgroundColor: currentPage === i ? subjectColor : `hsl(${subject.color} / 0.25)`,
                    }}
                  />
                ))}
                {isWriting && (
                  <div className="w-6 h-2 rounded-full animate-pulse" style={{ backgroundColor: subjectColor }} />
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => flipPage("next")}
                disabled={currentPage >= (isWriting ? filtered.length : filtered.length - 1)}
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* ============ LIST VIEW ============ */
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
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_CONFIG[entry.status].bg} ${STATUS_CONFIG[entry.status].color}`}>
                        {STATUS_CONFIG[entry.status].label}
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
