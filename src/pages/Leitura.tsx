import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, CheckCircle2, Flame, Star, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const BOOKS = [
  {
    id: 1, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry",
    totalPages: 96, readPages: 64, deadline: "15/03/2026",
    checkIns: 8, streak: 5, assigned: true,
  },
  {
    id: 2, title: "A Bolsa Amarela", author: "Lygia Bojunga",
    totalPages: 136, readPages: 20, deadline: "30/03/2026",
    checkIns: 3, streak: 2, assigned: true,
  },
  {
    id: 3, title: "O Menino Maluquinho", author: "Ziraldo",
    totalPages: 120, readPages: 120, deadline: "10/02/2026",
    checkIns: 15, streak: 15, assigned: false,
  },
];

const BADGES = [
  { name: "Leitor Iniciante", emoji: "📖", earned: true, desc: "Primeiro check-in de leitura" },
  { name: "5 Dias Lendo", emoji: "🔥", earned: true, desc: "5 check-ins consecutivos" },
  { name: "10 Dias Lendo", emoji: "⭐", earned: false, desc: "10 check-ins consecutivos" },
  { name: "Leitor do Mês", emoji: "🏆", earned: false, desc: "Maior streak do mês" },
  { name: "Rato de Biblioteca", emoji: "🐭", earned: false, desc: "Completar 5 livros" },
  { name: "Livro Completo", emoji: "📚", earned: true, desc: "Terminar um livro inteiro" },
];

export default function Leitura() {
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pages, setPages] = useState("");
  const [comment, setComment] = useState("");

  const doCheckIn = (bookId: number) => {
    setCheckingIn(null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1, scale: 0 }}
                animate={{ y: window.innerHeight, opacity: 0, scale: 1 }}
                transition={{ duration: 2, delay: Math.random() * 0.5 }}
                className="absolute text-2xl"
              >
                {["📚", "⭐", "✨", "📖", "🎉"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" size={24} /> Leitura
          </h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas leituras e ganhe XP</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gamification-streak">
            <Flame size={18} />
            <span className="font-bold text-sm">5 dias</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Total Check-ins</p>
            <p className="font-bold text-sm">26</p>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4 mb-6">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-gamification-gold" /> Conquistas de Leitura
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BADGES.map(b => (
            <motion.div
              key={b.name}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] ${b.earned ? "bg-gamification-gold/10" : "bg-muted opacity-50"}`}
            >
              <span className="text-2xl mb-1">{b.emoji}</span>
              <span className="text-[9px] font-bold text-center">{b.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Books */}
      <div className="space-y-4">
        {BOOKS.map((book, i) => {
          const progress = Math.round((book.readPages / book.totalPages) * 100);
          const isComplete = progress >= 100;

          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-xl border border-border p-5 ${isComplete ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm">{book.title}</h3>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
                {isComplete && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">✓ Concluído</span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{book.readPages}/{book.totalPages} páginas</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Prazo: {book.deadline}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {book.checkIns} check-ins</span>
                  <span className="flex items-center gap-1"><Flame size={12} className="text-gamification-streak" /> {book.streak} dias</span>
                </div>

                {!isComplete && (
                  <>
                    {checkingIn === book.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" placeholder="Pág."
                          value={pages} onChange={e => setPages(e.target.value)}
                          className="w-16 h-8 rounded-md border border-input bg-background px-2 text-xs"
                        />
                        <Button size="sm" className="gradient-hero border-0 text-primary-foreground h-8 text-xs" onClick={() => doCheckIn(book.id)}>
                          ✓ Confirmar
                        </Button>
                      </div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => setCheckingIn(book.id)}>
                          📖 Li hoje!
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
