import { motion } from "framer-motion";
import { BookOpen, Video, PenLine, Layers, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  interativa: { icon: Layers, color: "bg-primary/10 text-primary", label: "Interativa" },
  caderno: { icon: PenLine, color: "bg-gamification-gold/10 text-gamification-gold", label: "Caderno" },
  mista: { icon: BookOpen, color: "bg-secondary/10 text-secondary", label: "Mista" },
  video: { icon: Video, color: "bg-gamification-badge/10 text-gamification-badge", label: "Vídeo" },
};

interface LessonCardProps {
  id: string;
  title: string;
  subject: string;
  type: string;
  time: string;
  bncc?: string;
  onClick?: () => void;
}

export default function LessonCard({ id, title, subject, type, time, bncc, onClick }: LessonCardProps) {
  const navigate = useNavigate();
  const cfg = typeConfig[type] || typeConfig.interativa;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // In a real app, we'd check if student or teacher
      // For the prototype, we can navigate to the student view
      navigate(`/aula/${id}`);
    }
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-md ${cfg.color}`}>
          <cfg.icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground">{subject} · {time}</p>
          {bncc && <p className="text-[10px] text-primary/70 mt-0.5">BNCC: {bncc}</p>}
        </div>
      </div>
    </motion.button>
  );
}
