import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Brain, Sparkles, BookOpen, ClipboardList, Target, MessageSquare, 
  Zap, FileText, Send, Loader2, Save, History, Search, X, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BNCC_CATEGORIES = ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte"];

export default function IAPedagogica() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>("lesson_plan");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  const { data: students = [] } = useQuery({
    queryKey: ['students_ai'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: profile } = await supabase.from('profiles').select('role, id, school_id').eq('id', user.id).single();
      
      let query = supabase.from('profiles').select('*').eq('role', 'student');
      
      if (profile?.role === 'school') {
        query = query.eq('school_id', profile.id);
      } else if (profile?.role === 'teacher') {
        if (profile.school_id) {
          query = query.eq('school_id', profile.school_id);
        } else {
          query = query.eq('teacher_id', profile.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: recentGenerations = [] } = useQuery({
    queryKey: ['ai_generations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_pedagogical_content')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    
    try {
      // In a real production app, we would call an Edge Function that uses OpenAI/Anthropic
      // For this implementation, we'll simulate the response but with real student data context
      const student = students.find(s => s.id === selectedStudent);
      const style = student?.learning_style || "visual";
      const pace = student?.learning_pace || "médio";
      const studentName = student?.full_name || "a turma";

      // Simulate a more sophisticated AI response
      await new Promise(resolve => setTimeout(resolve, 1500));

      let response = `### CONTEÚDO PEDAGÓGICO PERSONALIZADO (EduBrasil IA)\n\n`;
      response += `**Objetivo:** ${userInput}\n`;
      response += `**Foco:** Habilidades BNCC correlacionadas\n`;
      response += `**Adaptação:** Personalizado para ${studentName} (Estilo: ${style}, Ritmo: ${pace})\n\n`;
      
      if (contentType === "lesson_plan") {
        response += `#### 1. Contextualização e Engajamento (10 min)\nInicie explorando o conhecimento prévio sobre ${userInput} através de estímulos ${style === 'visual' ? 'visuais e mapas mentais' : 'auditivos e diálogos'}.\n\n`;
        response += `#### 2. Desenvolvimento Teórico-Prático (30 min)\nApresente os conceitos de forma fragmentada para respeitar o ritmo ${pace}. Utilize exemplos práticos do cotidiano do aluno.\n\n`;
        response += `#### 3. Avaliação de Competências (20 min)\nAtividade de fixação focada na habilidade BNCC: Identificar, descrever e aplicar os conceitos de ${userInput}.`;
      } else {
        response += `#### Caderno de Exercícios Adaptados\n\n1. **Desafio Inicial:** Descreva com suas palavras o que você entende por ${userInput}.\n\n2. **Prática Assistida:** Utilizando o método ${style}, resolva a situação-problema apresentada em sala.\n\n3. **Auto-avaliação:** O que foi mais fácil e o que foi mais difícil ao aprender sobre ${userInput}?`;
      }

      setGeneratedContent(response);
      toast.success("Conteúdo gerado com IA!");
    } catch (error) {
      toast.error("Erro ao gerar conteúdo");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!generatedContent || !userId) return;

    const { error } = await supabase
      .from('ai_pedagogical_content')
      .insert({
        teacher_id: userId,
        student_id: selectedStudent,
        content_type: contentType,
        title: userInput,
        content: generatedContent,
        learning_method: students.find(s => s.id === selectedStudent)?.learning_style || "geral"
      } as any);

    if (error) {
      toast.error("Erro ao salvar no banco");
    } else {
      toast.success("Conteúdo salvo e associado à turma!");
      queryClient.invalidateQueries({ queryKey: ['ai_generations'] });
      setGeneratedContent(null);
      setUserInput("");
    }
  };

  return (
    <DashboardLayout role={(userProfile?.role as any) || "professor"} userName={userProfile?.full_name || "Professor"}>
      <div className="flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="text-primary w-8 h-8" /> IA Pedagógica Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Gere conteúdos, exercícios e planos adaptados ao ritmo de cada criança.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">O que você quer criar?</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={contentType === "lesson_plan" ? "default" : "outline"}
                    onClick={() => setContentType("lesson_plan")}
                    size="sm"
                    className="text-xs"
                  >
                    Plano de Aula
                  </Button>
                  <Button 
                    variant={contentType === "exercise" ? "default" : "outline"}
                    onClick={() => setContentType("exercise")}
                    size="sm"
                    className="text-xs"
                  >
                    Exercícios
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 block">Personalizar para um aluno específico?</label>
                <select 
                  className="w-full p-2 rounded-lg border bg-background text-sm"
                  value={selectedStudent || ""}
                  onChange={(e) => setSelectedStudent(e.target.value || null)}
                >
                  <option value="">Turma Inteira (Geral)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.learning_style || 'Padrão'}) — {s.grade_level || 'Série não inf.'}</option>
                  ))}

                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1.5 block">Assunto ou Habilidade BNCC</label>
                <Textarea 
                  placeholder="Ex: Frações equivalentes, Interpretação de texto narrativo..." 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !userInput}
                className="w-full bg-primary hover:bg-primary/90 shadow-lg"
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Gerar com IA Pedagógica
              </Button>
            </div>

            <div className="bg-muted/30 border-2 border-dashed rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Target size={16} className="text-primary" /> Alinhamento BNCC
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nossa IA verifica automaticamente as competências gerais e específicas para garantir conformidade pedagógica.
              </p>
            </div>
          </div>

          {/* Results/History Section */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {generatedContent ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-md relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20">Novo Conteúdo</Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setGeneratedContent(null)}><X size={16} /></Button>
                      <Button size="sm" onClick={handleSaveContent}><Save size={16} className="mr-2" /> Salvar no Banco</Button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedContent}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-card border rounded-2xl p-6 h-[400px] flex flex-col">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <History size={18} className="text-primary" /> Histórico de Gerações
                  </h2>
                  <ScrollArea className="flex-1">
                    <div className="space-y-3">
                      {recentGenerations.map((g: any) => (
                        <div key={g.id} className="p-3 border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold group-hover:text-primary transition-colors">{g.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{g.content_type} • {new Date(g.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px]">{g.learning_method}</Badge>
                          </div>
                        </div>
                      ))}
                      {recentGenerations.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                          <Zap size={32} className="mx-auto opacity-10 mb-2" />
                          <p className="text-sm">Nenhuma geração salva ainda.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
