import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Brain, Sparkles, BookOpen, FileText, Send, Loader2, Save, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function IAPedagogica() {
  const queryClient = useQueryClient();
  const { user: userProfile, loading: profileLoading } = useCurrentUser();
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>("lesson_plan");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ['students_ai', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) return [];
      let query = supabase.from('profiles').select('*').eq('role', 'student');
      
      if (userProfile.role === 'school') {
        query = query.eq('school_id', userProfile.id);
      } else if (userProfile.role === 'teacher') {
        if (userProfile.school_id) {
          query = query.eq('school_id', userProfile.school_id);
        } else {
          query = query.eq('teacher_id', userProfile.id);
        }
      }
      const { data, error } = await query;
      return data || [];
    },
    enabled: !!userProfile
  });

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    try {
      // Mock generation for demo
      setTimeout(() => {
        setGeneratedContent(`Conteúdo pedagógico gerado para: ${userInput}\n\nEste plano foca no desenvolvimento de competências cognitivas e socioemocionais...`);
        setIsGenerating(false);
        toast.success("Conteúdo gerado com IA!");
      }, 2000);
    } catch (error) {
      toast.error("Erro ao gerar conteúdo");
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !userProfile) return;
    const { error } = await supabase
      .from('ai_pedagogical_content')
      .insert({
        teacher_id: userProfile.id,
        student_id: selectedStudent,
        content_type: contentType,
        title: userInput,
        content: generatedContent,
      } as any);

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Conteúdo salvo!");
      setGeneratedContent(null);
      setUserInput("");
    }
  };

  if (profileLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <DashboardLayout role={(userProfile?.role as any) || "professor"} userName={userProfile?.full_name || "Professor"}>
      <div className="flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary w-8 h-8" /> IA Pedagógica Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Gere conteúdos, exercícios e planos adaptados.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">O que você quer criar?</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={contentType === "lesson_plan" ? "default" : "outline"} onClick={() => setContentType("lesson_plan")} size="sm">Plano Aula</Button>
                  <Button variant={contentType === "exercise" ? "default" : "outline"} onClick={() => setContentType("exercise")} size="sm">Exercícios</Button>
                </div>
              </div>
              <Textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Descreva o tema ou objetivo..." className="min-h-[120px]" />
              <Button className="w-full gradient-hero" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={16} />} Gerar com IA
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {generatedContent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg">Resultado da IA</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setGeneratedContent(null)}><X size={16} /></Button>
                    <Button className="bg-secondary text-white" size="sm" onClick={handleSave}><Save size={16} className="mr-2" /> Salvar</Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">{generatedContent}</ScrollArea>
              </motion.div>
            ) : (
              <div className="bg-card border-2 border-dashed rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                <Brain size={48} className="text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">Aguardando sua ideia para começar a criar...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
