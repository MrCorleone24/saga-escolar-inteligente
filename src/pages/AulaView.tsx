import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import CheckInPresenca from "@/components/presenca/CheckInPresenca";
import { BookOpen, PenLine, FileText, Send, ChevronLeft, Youtube, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AulaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploads, setUploads] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [presencaDone, setPresencaDone] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        subject: data.subjects?.name || "Desconhecido"
      };
    },
    enabled: !!id
  });

  const submitAnswers = useMutation({
    mutationFn: async () => {
      if (!userId || !lesson) return;

      const content = Object.entries(answers)
        .map(([qId, text]) => `Questão ${qId}: ${text}`)
        .join('\n\n');

      const { error } = await supabase
        .from('notebook_entries')
        .insert({
          student_id: userId,
          lesson_id: lesson.id,
          subject_id: lesson.subject_id,
          title: `Atividades: ${lesson.title}`,
          content: content,
          status: 'enviado',
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Respostas enviadas com sucesso! +25 XP");
    },
    onError: () => {
      toast.error("Erro ao enviar respostas.");
    }
  });

  const handleUpload = (questionId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploads(prev => ({ ...prev, [questionId]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !lesson) return <div className="p-8">Carregando aula...</div>;

  return (
    <DashboardLayout role="aluno" userName="Aluno" xp={450} level={5}>
      {!presencaDone && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 max-w-sm mx-auto">
          <CheckInPresenca streak={12} onCheckIn={() => setPresencaDone(true)} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-muted-foreground">
          <ChevronLeft size={14} className="mr-1" /> Voltar
        </Button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{lesson.subject}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">Tipo: {lesson.type}</span>
        </div>
        <h1 className="text-xl font-bold">{lesson.title}</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><BookOpen size={16} /> Instruções</h3>
            <p className="text-sm bg-primary/5 rounded-lg p-3 border border-primary/10">{lesson.content || "Siga as orientações do professor."}</p>
          </div>
          {lesson.type === 'video' && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
               <iframe className="w-full h-full" src="https://www.youtube.com/embed/ITi6vX67N8U" allowFullScreen />
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <PenLine size={16} className="text-gamification-gold" />
            <span className="font-bold text-sm">Caderno Digital</span>
          </div>
          <div className="space-y-4">
            {[1, 2].map(qId => (
              <div key={qId} className="space-y-2">
                <p className="text-sm font-medium">Questão {qId}:</p>
                <Textarea
                  value={answers[qId] || ""}
                  onChange={e => setAnswers(prev => ({ ...prev, [qId]: e.target.value }))}
                  placeholder="Sua resposta..."
                  disabled={submitted}
                />
              </div>
            ))}
            {!submitted ? (
              <Button onClick={() => submitAnswers.mutate()} className="w-full mt-4 gradient-hero border-0 text-white" disabled={submitAnswers.isPending}>
                <Send size={14} className="mr-1.5" /> {submitAnswers.isPending ? "Enviando..." : "Enviar para o Caderno"}
              </Button>
            ) : (
              <div className="mt-4 p-3 bg-secondary/10 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-1" />
                <p className="text-sm font-bold text-secondary">Enviado com sucesso!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
