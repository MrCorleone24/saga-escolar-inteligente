import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, BookOpen, XCircle, Flame, Plus, Loader2, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type DayStatus = "present" | "absent" | "pending" | "weekend" | "future" | "holiday";

interface DayData {
  day: number;
  status: DayStatus;
  lessons?: string[];
  events?: any[];
  xp?: number;
}

interface SchoolEvent {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string;
  school_id: string;
  created_by?: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  lesson_id?: string;
  status: string;
  date: string;
}

export default function CalendarioEscolar() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user: userProfile, loading: userLoading } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("aula");
  const [eventDate, setEventDate] = useState("");
  const [eventSchoolId, setEventSchoolId] = useState("");

  const { data: schools = [] } = useQuery({
    queryKey: ['schools-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, school_name').eq('role', 'school');
      if (error) return [];
      return data;
    },
    enabled: userProfile?.role === 'admin'
  });

  const { data: schoolEvents = [], isLoading: eventsLoading } = useQuery<SchoolEvent[]>({
    queryKey: ['school-events', userProfile?.school_id, userProfile?.role, currentDate.getMonth()],
    queryFn: async () => {
      if (!userProfile) return [];
      
      let query = supabase.from('school_calendar_events').select('*');
      
      if (userProfile.role !== 'admin') {
        const targetId = userProfile.school_id || userProfile.id;
        query = query.eq('school_id', targetId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SchoolEvent[];
    },
    enabled: !!userProfile
  });

  const { data: attendanceData = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ['user-attendance', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id || userProfile.role !== 'aluno') return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', userProfile.id);
      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!userProfile && userProfile.role === 'aluno'
  });

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (userProfile?.role === 'admin' && !eventSchoolId) {
      toast.error("Selecione uma escola para o evento");
      return;
    }

    setLoading(true);
    const targetId = userProfile?.role === 'admin' ? eventSchoolId : (userProfile?.school_id || userProfile?.id);

    const { error } = await supabase
      .from('school_calendar_events')
      .insert({
        title: eventTitle,
        event_type: eventType,
        start_time: new Date(eventDate).toISOString(),
        end_time: new Date(eventDate).toISOString(),
        school_id: targetId,
        created_by: userProfile?.id
      } as any);

    setLoading(false);
    if (error) {
      toast.error("Erro ao criar evento");
    } else {
      toast.success("Evento criado com sucesso!");
      setIsModalOpen(false);
      setEventTitle("");
      setEventDate("");
      setEventSchoolId("");
      queryClient.invalidateQueries({ queryKey: ['school-events'] });
    }
  };

  const generateMonthData = (): DayData[] => {
    const days: DayData[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, status: "future" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      
      let status: DayStatus = "future";
      if (dow === 0 || dow === 6) {
        status = "weekend";
      } else if (date < today) {
        const attendance = attendanceData.find(a => a.date === dateStr);
        if (attendance) {
          status = attendance.status === 'presente' ? "present" : "absent";
        } else {
          status = "absent"; 
        }
      } else if (date.getTime() === today.getTime()) {
        const attendance = attendanceData.find(a => a.date === dateStr);
        status = attendance ? (attendance.status === 'presente' ? "present" : "absent") : "pending";
      }

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
        lessons: dayEvents.filter(e => e.event_type === 'aula').map(e => e.title)
      });
    }

    return days;
  };

  const days: DayData[] = generateMonthData();
  const totalPresent = attendanceData.filter((a: AttendanceRecord) => a.status === 'presente').length;
  const totalAbsent = attendanceData.filter((a: AttendanceRecord) => a.status === 'falta').length;
  const attendanceRate = (totalPresent + totalAbsent) > 0 
    ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) 
    : 0;

  const isAdmin = ['school', 'admin', 'professor', 'teacher', 'teacher_solo', 'teacher_institutional'].includes(userProfile?.role);

  const handleExportPDF = async () => {
    const element = document.getElementById('calendar-content');
    if (!element) return;
    
    toast.info("Gerando relatório mensal...");
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`calendario-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}.pdf`);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  if (userLoading || eventsLoading) {
    return (
      <DashboardLayout role="aluno" userName="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role={(userProfile?.role as any) || "aluno"} 
      userName={userProfile?.full_name || "Usuário"} 
      xp={userProfile?.xp || 0} 
      level={userProfile?.level || 1}
    >
      <div id="calendar-content" className="print:p-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-card p-4 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CalendarIcon className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calendário Escolar</h1>
              <p className="text-sm text-muted-foreground">Acompanhe aulas, presença e eventos.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="h-10 border-primary/20 hover:bg-primary/5 text-primary" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            
            {isAdmin && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-hero text-white font-bold h-10 px-6">
                    <Plus className="mr-2 h-4 w-4" /> Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Evento ao Calendário</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título do Evento</Label>
                      <Input id="title" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Ex: Aula de Matemática, Reunião de Pais..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aula">Aula</SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data</Label>
                      <Input id="date" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
                    </div>
                    {userProfile?.role === 'admin' && (
                      <div className="grid gap-2">
                        <Label htmlFor="school">Escola</Label>
                        <Select value={eventSchoolId} onValueChange={setEventSchoolId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Vincular à Escola" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.school_name || s.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateEvent} disabled={loading} className="bg-primary text-white">
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Evento"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Stats (Mobile friendly grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Eventos no Mês", value: schoolEvents.length, color: "text-primary", icon: BookOpen },
            { label: "Presenças", value: totalPresent, color: "text-secondary", icon: CheckCircle2 },
            { label: "Taxa de Frequência", value: `${attendanceRate}%`, color: "text-blue-500", icon: CalendarIcon },
            { label: "XP Acumulado", value: userProfile?.xp || 0, color: "text-gamification-xp", icon: Flame },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-opacity-10 ${s.color.replace('text-', 'bg-')}`}>
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-6 bg-card p-2 rounded-xl border border-border">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="font-bold text-lg text-primary capitalize">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <ChevronRight size={20} />
          </Button>
        </div>

        {/* Calendar grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-tighter">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <motion.div
                key={i}
                whileHover={d.day > 0 ? { scale: 1.02, y: -2 } : {}}
                className={`rounded-xl border p-3 min-h-[100px] transition-all relative ${
                  d.day === 0 ? "invisible" : 
                  d.status === "present" ? "bg-green-50/50 border-green-200" :
                  d.status === "absent" ? "bg-red-50/50 border-red-200" :
                  d.status === "pending" ? "bg-amber-50 border-amber-200 ring-2 ring-amber-100 ring-offset-0" :
                  d.status === "weekend" ? "bg-muted/30 text-muted-foreground/40 border-transparent" :
                  d.status === "holiday" ? "bg-indigo-50 border-indigo-200" :
                  "bg-background text-muted-foreground/30 border-border"
                }`}
              >
                {d.day > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{d.day}</span>
                      {d.status === "present" && <CheckCircle2 size={14} className="text-green-600" />}
                      {d.status === "absent" && <XCircle size={14} className="text-red-600" />}
                    </div>
                    
                    <div className="space-y-1">
                      {d.events && d.events.map((e, j) => (
                        <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate ${
                          e.event_type === 'feriado' ? 'bg-indigo-600 text-white' : 
                          e.event_type === 'aula' ? 'bg-primary/10 text-primary border border-primary/20' : 
                          'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {userProfile?.role === 'admin' && e.school_id && (
                            <span className="text-[8px] bg-white/20 px-1 rounded mr-1">
                              {schools.find(s => s.id === e.school_id)?.school_name?.substring(0, 3) || 'ESC'}
                            </span>
                          )}
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-6 justify-center bg-card p-4 rounded-xl border border-border">
        {[
          { color: "bg-green-500", label: "Presente" },
          { color: "bg-red-500", label: "Falta" },
          { color: "bg-amber-500", label: "Pendente" },
          { color: "bg-indigo-600", label: "Feriado" },
          { color: "bg-muted", label: "Fim de semana" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${l.color}`} />
            <span className="text-xs font-medium text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}