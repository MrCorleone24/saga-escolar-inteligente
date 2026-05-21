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
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'aluno');
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
    
    // Simulating AI logic with BNCC and personalized learning
    // In a real app, this would call a Supabase Edge Function or an AI provider via Lovable AI Gateway
    setTimeout(async () => {
      const student = students.find(s => s.id === selectedStudent);
      const style = student?.learning_style || "visual";
      const pace = student?.learning_pace || "médio";

      let response = `### CONTEÚDO ALINHADO À BNCC\n\n`;
      response += `**Título:** ${userInput}\n`;
      response += `**Público-alvo:** Ensino Fundamental\n`;
      response += `**Personalização:** Adaptado para ritmo ${pace} e estilo ${style}.\n\n`;
      
      if (contentType === "lesson_plan") {
        response += `#### Objetivos de Aprendizagem\n- Identificar e aplicar conceitos básicos de ${userInput}.\n- Desenvolver habilidades críticas conforme BNCC (EF01MA01).\n\n`;
        response += `#### Cronograma\n1. Introdução lúdica (15 min)\n2. Atividade prática com ${style} (30 min)\n3. Conclusão e reflexão (15 min)`;
      } else {
        response += `#### Exercícios Propostos\n1. Qual o conceito principal de ${userInput}?\n2. Como aplicar o método adaptado ao seu cotidiano?\n3. Desenhe/Escreva um exemplo prático.`;
      }

      setGeneratedContent(response);
      setIsGenerating(false);
      toast.success("Conteúdo gerado com sucesso!");
    }, 2000);
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
    <DashboardLayout role="professor" userName="Prof. Maria Santos">
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
                    <option key={s.id} value={s.id}>{s.full_name} ({s.learning_style || 'Padrão'})</option>
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
