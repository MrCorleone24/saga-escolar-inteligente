import { useState } from "react";
import { Check, X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AttendanceListProps {
  lessonId: string;
  students: any[];
}

export default function AttendanceList({ lessonId, students }: AttendanceListProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('lesson_id', lessonId);
      if (error) throw error;
      return data;
    }
  });

  const handleMarkAttendance = async (studentId: string, status: 'presente' | 'falta') => {
    setSubmitting(studentId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          lesson_id: lessonId,
          student_id: studentId,
          status,
          marked_by: user?.id,
          date: new Date().toISOString().split('T')[0]
        }, { onConflict: 'lesson_id,student_id,date' });

      if (error) throw error;
      
      toast.success(`Presença marcada: ${status}`);
      queryClient.invalidateQueries({ queryKey: ['attendance', lessonId] });
    } catch (error) {
      toast.error("Erro ao registrar presença");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-2">
      {students.map((student) => {
        const record = attendance.find(a => a.student_id === student.id);
        const isSubmitting = submitting === student.id;

        return (
          <div key={student.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                {student.full_name?.charAt(0)}
              </div>
              <span className="text-sm font-medium">{student.full_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={record?.status === 'presente' ? "secondary" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${record?.status === 'presente' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600/30 text-green-500 hover:bg-green-600/10'}`}
                onClick={() => handleMarkAttendance(student.id, 'presente')}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                variant={record?.status === 'falta' ? "destructive" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${record?.status === 'falta' ? '' : 'border-red-600/30 text-red-500 hover:bg-red-600/10'}`}
                onClick={() => handleMarkAttendance(student.id, 'falta')}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
