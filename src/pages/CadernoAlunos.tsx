import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, BookOpen, PenLine, CheckCircle2, Clock, MessageSquare, Search, Star, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STUDENTS = [
  { id: 1, name: "João Silva", grade: "3º A", avatar: "J", entries: 12, pending: 2 },
  { id: 2, name: "Maria Oliveira", grade: "3º A", avatar: "M", entries: 15, pending: 0 },
  { id: 3, name: "Pedro Santos", grade: "3º A", avatar: "P", entries: 8, pending: 4 },
  { id: 4, name: "Ana Costa", grade: "3º B", avatar: "A", entries: 14, pending: 1 },
  { id: 5, name: "Lucas Ferreira", grade: "3º B", avatar: "L", entries: 10, pending: 3 },
];

const ENTRIES = [
  {
    id: 1, date: "26/02/2026", subject: "Português",
    content: "Hoje aprendemos sobre texto narrativo. A professora pediu para copiar o texto da formiguinha e a neve.",
    photo: null, status: "pendente",
  },
  {
    id: 2, date: "25/02/2026", subject: "Matemática",
    content: "Exercícios de multiplicação por 3 e 4.",
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
    status: "pendente",
  },
  {
    id: 3, date: "24/02/2026", subject: "Ciências",
    content: "Desenho do ciclo da água.",
    photo: null, status: "corrigido",
  },
];

export default function CadernoAlunos() {
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [correction, setCorrection] = useState("");
  const [grade, setGrade] = useState("");

  const filtered = STUDENTS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const selectedStudent = STUDENTS.find(s => s.id === selected);

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
          {filtered.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(s.id)}
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

              {ENTRIES.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{entry.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{entry.subject}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${entry.status === "corrigido" ? "bg-secondary/10 text-secondary" : "bg-gamification-gold/10 text-gamification-gold"}`}>
                      {entry.status === "corrigido" ? "✓ Corrigido" : "⏳ Pendente"}
                    </span>
                  </div>

                  <p className="text-sm mb-3">{entry.content}</p>
                  {entry.photo && <img src={entry.photo} alt="Caderno" className="rounded-lg border border-border max-h-40 object-cover mb-3" />}

                  {entry.status === "pendente" && (
                    <div className="border-t border-border pt-3 mt-3 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Nota/Avaliação" value={grade} onChange={e => setGrade(e.target.value)} className="w-32" />
                        <Textarea placeholder="Comentário para o aluno..." value={correction} onChange={e => setCorrection(e.target.value)} rows={2} className="flex-1" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gradient-hero border-0 text-primary-foreground">
                          <CheckCircle2 size={12} className="mr-1" /> Corrigir
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare size={12} className="mr-1" /> Devolver
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
