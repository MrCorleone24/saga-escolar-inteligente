import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Video, BookOpen, PenLine, Layers, Save, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SUBJECTS } from "@/lib/subjects";

const TYPES = [
  { value: "interativa", label: "Interativa", icon: Layers, desc: "Aluno resolve no digital" },
  { value: "caderno", label: "Caderno", icon: PenLine, desc: "Aluno faz no caderno físico" },
  { value: "mista", label: "Mista", icon: BookOpen, desc: "Digital + caderno" },
  { value: "video", label: "Vídeo/Doc", icon: Video, desc: "Aula baseada em vídeo" },
];

interface LessonPlanFormProps {
  grade?: number;
  onClose?: () => void;
  onSave?: (data: any) => void;
}

export default function LessonPlanForm({ grade = 3, onClose, onSave }: LessonPlanFormProps) {
  const [form, setForm] = useState({
    title: "", subject: SUBJECTS[0].name, type: "interativa", grade,
    content: "", instructions: "", youtubeUrl: "", bncc: "", duration: "50",
    activityType: "exercicio", isGenerating: false,
  });

  const update = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Criar Nova Aula</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}><X size={14} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Ano Escolar</label>
          <select value={form.grade} onChange={e => update("grade", +e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            {[1,2,3,4,5,6,7].map(g => <option key={g} value={g}>{g}º Ano</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Disciplina</label>
          <select value={form.subject} onChange={e => update("subject", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            {SUBJECTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Código BNCC</label>
          <Input value={form.bncc} onChange={e => update("bncc", e.target.value)} placeholder="Ex: EF03LP01" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de Aula</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => update("type", t.value)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${form.type === t.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
            >
              <t.icon size={20} className={form.type === t.value ? "text-primary" : "text-muted-foreground"} />
              <p className="text-xs font-bold mt-1.5">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Título da Aula</label>
        <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Ex: Leitura e Interpretação de Texto Narrativo" />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Conteúdo da Aula</label>
        <Textarea value={form.content} onChange={e => update("content", e.target.value)} rows={6} placeholder="Escreva o conteúdo que o aluno irá estudar..." />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Instruções para o Aluno</label>
        <Textarea value={form.instructions} onChange={e => update("instructions", e.target.value)} rows={3} placeholder='Ex: "Leia o texto abaixo com atenção e copie no caderno as palavras destacadas"' />
      </div>

      {(form.type === "video") && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Link do YouTube</label>
          <Input value={form.youtubeUrl} onChange={e => update("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          {form.youtubeUrl && form.youtubeUrl.includes("youtube") && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${form.youtubeUrl.split("v=")[1]?.split("&")[0] || ""}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Duração (min)</label>
          <Input type="number" value={form.duration} onChange={e => update("duration", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Atividade Vinculada</label>
          <select value={form.activityType} onChange={e => update("activityType", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="exercicio">Exercícios</option>
            <option value="teste">Teste</option>
            <option value="prova">Prova</option>
            <option value="pesquisa">Pesquisa</option>
            <option value="interpretacao">Interpretação</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
          className="gradient-badge border-0 text-primary-foreground" 
          disabled={form.isGenerating}
          onClick={() => {
            update("isGenerating", true);
            setTimeout(() => {
              const contentMap: Record<string, any> = {
                "Português": { title: "Leitura de Crônicas", content: "As crônicas são textos curtos que narram fatos do cotidiano...", instructions: "Leia e escreva uma mini-crônica sobre seu dia.", bncc: "EF05LP10" },
                "Matemática": { title: "Fração e Porcentagem", content: "A porcentagem é uma forma de expressar uma proporção...", instructions: "Resolva os problemas interativos e mostre o cálculo no caderno.", bncc: "EF05MA06" },
                "Ciências": { title: "O Sistema Solar", content: "O Sistema Solar é formado pelo Sol e todos os corpos que orbitam ao seu redor...", instructions: "Assista ao vídeo e faça o mapa mental no caderno.", youtubeUrl: "https://www.youtube.com/watch?v=ITi6vX67N8U", bncc: "EF05CI11" },
                "Tecnologia e IA": { title: "Como a IA aprende?", content: "A IA aprende através de padrões em grandes volumes de dados...", instructions: "Crie um algoritmo simples de decisão no caderno.", bncc: "EF05TE01" },
              };
              const mock = contentMap[form.subject as string] || { title: `Aula de ${form.subject}`, content: `Conteúdo detalhado sobre ${form.subject}...`, instructions: "Siga as orientações da aula.", bncc: "BNCC-Geral" };
              setForm(f => ({ ...f, ...mock, isGenerating: false }));
            }, 1500);
          }}
        >
          <Brain size={14} className={`mr-1.5 ${form.isGenerating ? "animate-pulse" : ""}`} /> 
          {form.isGenerating ? "Gerando..." : "Gerar com IA"}
        </Button>
        <Button variant="outline" onClick={() => {/* preview */}}>
          <Eye size={14} className="mr-1.5" /> Preview
        </Button>
        <Button className="gradient-hero border-0 text-primary-foreground" onClick={() => onSave?.(form)}>
          <Save size={14} className="mr-1.5" /> Salvar Aula
        </Button>
      </div>
    </motion.div>
  );
}
