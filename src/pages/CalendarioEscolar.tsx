import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock, BookOpen, XCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type DayStatus = "present" | "absent" | "pending" | "weekend" | "future" | "holiday";

interface DayData {
  day: number;
  status: DayStatus;
  lessons?: string[];
  xp?: number;
}

const generateMonth = (): DayData[] => {
  const days: DayData[] = [];
  const startDay = 0; // Feb 2026 starts on Sunday
  for (let i = 0; i < startDay; i++) days.push({ day: 0, status: "future" });
  for (let d = 1; d <= 28; d++) {
    const dow = (startDay + d - 1) % 7;
    if (dow === 0 || dow === 6) {
      days.push({ day: d, status: "weekend" });
    } else if (d < 26) {
      days.push({
        day: d,
        status: d % 7 === 0 ? "absent" : "present",
        lessons: d % 2 === 0 ? ["Português", "Matemática", "Ciências"] : ["História", "Geografia", "Inglês"],
        xp: d % 7 === 0 ? 0 : 10 + (d % 5) * 5,
      });
    } else if (d === 26) {
      days.push({ day: d, status: "pending", lessons: ["Português", "Matemática", "Ciências"] });
    } else {
      days.push({ day: d, status: "future" });
    }
  }
  return days;
};

const statusStyles: Record<DayStatus, string> = {
  present: "bg-secondary/10 border-secondary/30 text-foreground",
  absent: "bg-destructive/10 border-destructive/30 text-foreground",
  pending: "bg-gamification-gold/10 border-gamification-gold/30 text-foreground animate-pulse-glow",
  weekend: "bg-muted/50 text-muted-foreground",
  future: "bg-background text-muted-foreground/40",
  holiday: "bg-accent/10 border-accent/30 text-foreground",
};

const statusIcon: Record<DayStatus, React.ReactNode> = {
  present: <CheckCircle2 size={10} className="text-secondary" />,
  absent: <XCircle size={10} className="text-destructive" />,
  pending: <Clock size={10} className="text-gamification-gold" />,
  weekend: null,
  future: null,
  holiday: null,
};

export default function CalendarioEscolar() {
  const days = generateMonth();
  const streak = 12;
  const totalPresent = days.filter(d => d.status === "present").length;
  const totalDays = days.filter(d => d.status !== "weekend" && d.status !== "future" && d.day > 0).length;

  return (
    <DashboardLayout role="aluno" userName="João Silva" xp={450} level={5}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-primary" size={24} /> Calendário Escolar
          </h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas aulas, presença e progresso diário</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gamification-streak">
            <Flame size={18} />
            <span className="font-bold text-sm">{streak} dias</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Presença</p>
            <p className="font-bold text-sm text-secondary">{totalPresent}/{totalDays} ({Math.round(totalPresent/totalDays*100)}%)</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Aulas Concluídas", value: "47", color: "text-secondary" },
          { label: "XP do Mês", value: "520", color: "text-gamification-xp" },
          { label: "Streak Máximo", value: "15 dias", color: "text-gamification-streak" },
          { label: "Faltas", value: "3", color: "text-destructive" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
        <h2 className="font-bold">Fevereiro 2026</h2>
        <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
      </div>

      {/* Calendar grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`rounded-lg border p-2 min-h-[70px] transition-colors cursor-pointer hover:shadow-sm ${d.day === 0 ? "invisible" : statusStyles[d.status]}`}
            >
              {d.day > 0 && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{d.day}</span>
                    {statusIcon[d.status]}
                  </div>
                  {d.lessons && (
                    <div className="space-y-0.5">
                      {d.lessons.slice(0, 2).map((l, j) => (
                        <p key={j} className="text-[8px] truncate">{l}</p>
                      ))}
                      {d.lessons.length > 2 && <p className="text-[8px] text-muted-foreground">+{d.lessons.length - 2}</p>}
                    </div>
                  )}
                  {d.xp && d.xp > 0 && <p className="text-[8px] text-gamification-xp font-bold mt-0.5">+{d.xp} XP</p>}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        {[
          { color: "bg-secondary", label: "Presente" },
          { color: "bg-destructive", label: "Falta" },
          { color: "bg-gamification-gold", label: "Pendente" },
          { color: "bg-muted", label: "Fim de semana" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
