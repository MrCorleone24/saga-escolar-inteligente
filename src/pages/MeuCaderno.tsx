import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, PenLine, Upload, MessageSquare, CheckCircle2, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUBJECTS = ["Português", "Matemática", "Ciências", "História", "Geografia", "Inglês", "Artes"];

const MOCK_ENTRIES = [
  {
    id: 1, date: "26/02/2026", subject: "Português",
    content: "Hoje aprendemos sobre texto narrativo. A professora pediu para copiar o texto da formiguinha e a neve. Respondi as perguntas no caderno.",
    status: "corrigido", grade: "Muito Bem!", teacherNote: "Excelente trabalho, João! Suas respostas estão completas.",
    photo: null,
  },
  {
    id: 2, date: "25/02/2026", subject: "Matemática",
    content: "Exercícios de multiplicação por 3 e 4. Fiz as tabuadas e os problemas da página 42.",
    status: "pendente", grade: null, teacherNote: null,
    photo: null,
  },
  {
    id: 3, date: "24/02/2026", subject: "Ciências",
    content: "",
    status: "corrigido", grade: "Bom trabalho!", teacherNote: "O desenho do ciclo da água ficou muito bom. Faltou indicar a evaporação.",
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
  },
];

export default function MeuCaderno() {
  const [activeSubject, setActiveSubject] = useState("Português");
  const [newEntry, setNewEntry] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setNewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filtered = MOCK_ENTRIES.filter(e => e.subject === activeSubject);

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenLine className="text-gamification-gold" size={24} /> Meu Caderno
          </h1>
          <p className="text-muted-foreground text-sm">Seu caderno digital organizado por matéria e data</p>
        </div>
      </motion.div>

      {/* Subject tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {SUBJECTS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeSubject === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New entry */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-5 sticky top-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <PenLine size={14} className="text-primary" /> Nova Entrada
            </h3>
            <p className="text-xs text-muted-foreground mb-3">26/02/2026 · {activeSubject}</p>
            <Textarea
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder="Escreva aqui o que aprendeu hoje..."
              rows={6}
            />
            <label className="flex items-center gap-2 mt-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
              <Upload size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{newPhoto ? "Foto adicionada ✓" : "Adicionar foto do caderno"}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            </label>
            {newPhoto && <img src={newPhoto} alt="Preview" className="mt-2 rounded-lg border border-border max-h-32 object-cover w-full" />}
            <Button className="w-full mt-3 gradient-hero border-0 text-primary-foreground">
              Salvar no Caderno
            </Button>
          </div>
        </motion.div>

        {/* Entries */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma entrada em {activeSubject}</p>
              <p className="text-xs">Comece escrevendo algo no caderno!</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{entry.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${entry.status === "corrigido" ? "bg-secondary/10 text-secondary" : "bg-gamification-gold/10 text-gamification-gold"}`}>
                      {entry.status === "corrigido" ? "✓ Corrigido" : "⏳ Pendente"}
                    </span>
                  </div>
                  {entry.grade && (
                    <span className="flex items-center gap-1 text-xs font-bold text-secondary">
                      <Star size={12} /> {entry.grade}
                    </span>
                  )}
                </div>

                {entry.content && <p className="text-sm leading-relaxed mb-3">{entry.content}</p>}
                {entry.photo && <img src={entry.photo} alt="Caderno" className="rounded-lg border border-border max-h-48 object-cover mb-3" />}

                {entry.teacherNote && (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare size={12} className="text-primary" />
                      <span className="text-xs font-bold text-primary">Professora</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.teacherNote}</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
