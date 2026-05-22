import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, BookOpen, XCircle, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type DayStatus = "present" | "absent" | "pending" | "weekend" | "future" | "holiday";

interface DayData {
  day: number;
  status: DayStatus;
  lessons?: string[];
  events?: any[];
  xp?: number;
}

export default function CalendarioEscolar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
          setUserProfile(p);
        });
      }
    });
  }, []);

  const { data: schoolEvents = [] } = useQuery({
    queryKey: ['school-events', userProfile?.school_id, currentDate.getMonth()],
    queryFn: async () => {
      if (!userProfile?.school_id && userProfile?.role !== 'school' && userProfile?.role !== 'admin') return [];
      
      const targetId = userProfile.school_id || userProfile.id;
      const { data, error } = await supabase
        .from('school_calendar_events')
        .select('*')
        .eq('school_id', targetId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile
  });

  const generateMonthData = (): DayData[] => {
    const days: DayData[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, status: "future" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      
      let status: DayStatus = "future";
      if (dow === 0 || dow === 6) {
        status = "weekend";
      } else if (date < today) {
        status = "present"; // Placeholder for real attendance logic
      } else if (date.getTime() === today.getTime()) {
        status = "pending";
      }

      // Check for school events
      const dayEvents = schoolEvents.filter(e => {
        const eventDate = new Date(e.start_time);
        return eventDate.getDate() === d && eventDate.getMonth() === month && eventDate.getFullYear() === year;
      });

      if (dayEvents.some(e => e.event_type === 'feriado')) {
        status = "holiday";
      }

      days.push({
        day: d,
        status,
        events: dayEvents,
        lessons: status === "present" ? ["Aula Concluída"] : undefined
      });
    }

    return days;
  };

  const days = generateMonthData();
  const streak = 12; // Placeholder
  const totalPresent = days.filter(d => d.status === "present").length;
  const workDays = days.filter(d => d.day > 0 && d.status !== "weekend" && d.status !== "future").length;
  const attendanceRate = workDays > 0 ? Math.round((totalPresent / workDays) * 100) : 0;

  return (
    <DashboardLayout 
      role={(userProfile?.role as any) || "aluno"} 
      userName={userProfile?.full_name || "Usuário"} 
      xp={userProfile?.xp || 0} 
      level={userProfile?.level || 1}
    >

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24} /> Calendário Escolar
          </h1>
          <p className="text-muted-foreground text-sm">Acompanhe suas aulas, presença e eventos da escola</p>
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
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
          <ChevronLeft size={16} />
        </Button>
        <h2 className="font-bold uppercase tracking-widest text-sm">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
          <ChevronRight size={16} />
        </Button>
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
