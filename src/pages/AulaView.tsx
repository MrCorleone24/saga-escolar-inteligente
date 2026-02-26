import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import CheckInPresenca from "@/components/presenca/CheckInPresenca";
import { BookOpen, PenLine, Video, Upload, CheckCircle2, Send, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MOCK_LESSON = {
  id: "1",
  title: "Leitura e Interpretação de Texto Narrativo",
  subject: "Português",
  grade: 3,
  type: "mista",
  bncc: "EF03LP01",
  instructions: "Leia o texto abaixo com atenção. Depois, responda as perguntas no caderno digital ao lado. Para as questões 3 e 4, copie no caderno físico e envie uma foto.",
  content: `A Formiguinha e a Neve

Era uma vez uma formiguinha que morava em um pequeno buraco no jardim. Todo dia ela trabalhava muito, carregando folhas e sementes para guardar em sua casa.

Um dia, quando acordou, viu que tudo estava coberto de neve! A formiguinha nunca tinha visto neve antes e ficou muito surpresa.

— Que coisa branca e fria é essa? — perguntou ela, curiosa.

A borboleta, que passava voando, respondeu:
— É neve, formiguinha! Quando faz muito frio, a água das nuvens se transforma em flocos brancos.

A formiguinha tentou carregar um floco de neve para sua casa, mas quando chegou lá, o floco tinha derretido e virado água!

— Aprendi algo novo hoje! — disse a formiguinha, sorrindo. — A neve é feita de água!`,
  questions: [
    { id: 1, text: "Onde morava a formiguinha?", type: "digital" },
    { id: 2, text: "O que a formiguinha viu quando acordou?", type: "digital" },
    { id: 3, text: "Copie no caderno: Por que o floco de neve derreteu?", type: "caderno" },
    { id: 4, text: "Desenhe no caderno a cena da formiguinha vendo a neve pela primeira vez.", type: "caderno" },
  ],
};

export default function AulaView() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploads, setUploads] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [presencaDone, setPresencaDone] = useState(false);

  const handleUpload = (questionId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploads(prev => ({ ...prev, [questionId]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      {!presencaDone && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 max-w-sm mx-auto">
          <CheckInPresenca streak={12} onCheckIn={() => setPresencaDone(true)} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{MOCK_LESSON.subject}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{MOCK_LESSON.grade}º Ano</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">BNCC: {MOCK_LESSON.bncc}</span>
        </div>
        <h1 className="text-xl font-bold">{MOCK_LESSON.title}</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content side */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <BookOpen size={16} />
              <span className="font-bold text-sm">Instruções</span>
            </div>
            <p className="text-sm leading-relaxed bg-primary/5 rounded-lg p-3 border border-primary/10">{MOCK_LESSON.instructions}</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3 text-secondary">
              <BookOpen size={16} />
              <span className="font-bold text-sm">Texto</span>
            </div>
            <div className="prose prose-sm max-w-none">
              {MOCK_LESSON.content.split("\n\n").map((p, i) => (
                <p key={i} className="text-sm leading-relaxed mb-3 text-foreground">{p}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notebook side */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <PenLine size={16} className="text-gamification-gold" />
              <span className="font-bold text-sm">Caderno Digital</span>
              <span className="text-[10px] text-muted-foreground ml-auto">26/02/2026</span>
            </div>

            <div className="space-y-4">
              {MOCK_LESSON.questions.map(q => (
                <div key={q.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{q.id}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{q.text}</p>
                      {q.type === "digital" ? (
                        <Textarea
                          value={answers[q.id] || ""}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Digite sua resposta aqui..."
                          rows={3}
                          className="mt-2"
                          disabled={submitted}
                        />
                      ) : (
                        <div className="mt-2">
                          <label className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
                            <Upload size={16} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{uploads[q.id] ? "Foto enviada ✓" : "Enviar foto do caderno"}</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleUpload(q.id, e)} disabled={submitted} />
                          </label>
                          {uploads[q.id] && (
                            <img src={uploads[q.id]} alt="Caderno" className="mt-2 rounded-lg border border-border max-h-40 object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!submitted ? (
              <Button onClick={() => setSubmitted(true)} className="w-full mt-4 gradient-hero border-0 text-primary-foreground">
                <Send size={14} className="mr-1.5" /> Enviar Respostas
              </Button>
            ) : (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-4 p-3 bg-secondary/10 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-1" />
                <p className="text-sm font-bold text-secondary">Aula Concluída! +25 XP 🎉</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
