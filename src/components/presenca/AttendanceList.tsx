import { useState } from \"react\";
import { Check, X, User, Loader2, Download, Printer } from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { supabase } from \"@/integrations/supabase/client\";
import { toast } from \"sonner\";
import { useQuery, useQueryClient } from \"@tanstack/react-query\";
import { jsPDF } from \"jspdf\";
import html2canvas from \"html2canvas\";

interface AttendanceListProps {
  lessonId: string;
  students: any[];
  lessonName?: string;
}

export default function AttendanceList({ lessonId, students, lessonName }: AttendanceListProps) {
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
      toast.error(\"Erro ao registrar presença\");
    } finally {
      setSubmitting(null);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('attendance-report');
    if (!element) return;
    
    toast.info(\"Gerando PDF...\");
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: \"#ffffff\",
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`presenca-${lessonName || lessonId}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(\"PDF exportado com sucesso!\");
    } catch (error) {
      console.error(\"Erro ao exportar PDF:\", error);
      toast.error(\"Erro ao gerar PDF\");
    }
  };

  return (
    <div className=\"space-y-4\">
      <div className=\"flex items-center justify-between mb-2\">
        <h4 className=\"text-xs font-bold text-white/40 uppercase tracking-widest\">Status de Presença</h4>
        <Button 
          variant=\"ghost\" 
          size=\"sm\" 
          className=\"h-7 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20\"
          onClick={handleExportPDF}
        >
          <Download size={12} className=\"mr-1\" /> Exportar PDF
        </Button>
      </div>

      <div id=\"attendance-report\" className=\"space-y-2 p-2 rounded-lg\">
        <div className=\"hidden print:block mb-4 p-4 border-b text-black\">
          <h2 className=\"text-xl font-bold\">Relatório de Presença</h2>
          <p className=\"text-sm text-gray-500\">Aula: {lessonName || lessonId}</p>
          <p className=\"text-sm text-gray-500\">Data: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        {students.map((student) => {
          const record = attendance.find(a => a.student_id === student.id);
          const isSubmitting = submitting === student.id;

          return (
            <div key={student.id} className=\"flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 group\">
              <div className=\"flex items-center gap-3\">
                <div className=\"w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary\">
                  {student.full_name?.charAt(0)}
                </div>
                <span className=\"text-sm font-medium\">{student.full_name}</span>
              </div>
              
              <div className=\"flex items-center gap-2\">
                <Button
                  variant={record?.status === 'presente' ? \"secondary\" : \"outline\"}
                  size=\"sm\"
                  className={`h-8 w-8 p-0 ${record?.status === 'presente' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600/30 text-green-500 hover:bg-green-600/10'}`}
                  onClick={() => handleMarkAttendance(student.id, 'presente')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className=\"h-4 w-4 animate-spin\" /> : <Check className=\"h-4 w-4\" />}
                </Button>
                <Button
                  variant={record?.status === 'falta' ? \"destructive\" : \"outline\"}
                  size=\"sm\"
                  className={`h-8 w-8 p-0 ${record?.status === 'falta' ? '' : 'border-red-600/30 text-red-500 hover:bg-red-600/10'}`}
                  onClick={() => handleMarkAttendance(student.id, 'falta')}
                  disabled={isSubmitting}
                >
                  <X className=\"h-4 w-4\" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}