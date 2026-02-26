import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckInPresencaProps {
  onCheckIn?: (photo?: string) => void;
  streak?: number;
  checked?: boolean;
}

export default function CheckInPresenca({ onCheckIn, streak = 0, checked = false }: CheckInPresencaProps) {
  const [done, setDone] = useState(checked);
  const [showConfetti, setShowConfetti] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const handleCheckIn = () => {
    setDone(true);
    setShowConfetti(true);
    onCheckIn?.(photo || undefined);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (done) {
    return (
      <div className="relative">
        <AnimatePresence>
          {showConfetti && (
            <motion.div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * 200, opacity: 1, scale: 0 }}
                  animate={{ y: 200, opacity: 0, scale: 1, rotate: Math.random() * 360 }}
                  transition={{ duration: 1.5, delay: Math.random() * 0.5 }}
                  className="absolute text-2xl"
                >
                  {["⭐", "🎉", "✨", "🏆", "💯"][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-secondary/10 rounded-xl p-4 text-center border border-secondary/20"
        >
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-2" />
          </motion.div>
          <p className="font-bold text-secondary text-sm">Presença Confirmada! ✅</p>
          <p className="text-xs text-muted-foreground mt-1">+10 XP ganhos</p>
          {streak > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2 text-gamification-streak">
              <Flame size={14} />
              <span className="text-xs font-bold">{streak} dias seguidos!</span>
              {streak >= 5 && <span className="text-xs">+5 XP bônus</span>}
            </div>
          )}
          {photo && <img src={photo} alt="Check-in" className="w-16 h-16 rounded-full object-cover mx-auto mt-3 border-2 border-secondary" />}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="text-center">
        <Star className="w-8 h-8 text-gamification-gold mx-auto mb-2" />
        <p className="font-bold text-sm">Check-in de Presença</p>
        <p className="text-xs text-muted-foreground">Confirme sua presença e ganhe XP!</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <Camera size={14} />
          <span>{photo ? "Foto tirada ✓" : "Tirar foto (opcional)"}</span>
          <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
        </label>
        {photo && <img src={photo} alt="preview" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />}
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
        <Button onClick={handleCheckIn} className="w-full gradient-hero border-0 text-primary-foreground font-bold py-5">
          <CheckCircle2 size={18} className="mr-2" /> Fazer Check-in 🎯
        </Button>
      </motion.div>

      {streak > 0 && (
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Flame size={12} className="text-gamification-streak" /> Streak atual: {streak} dias
        </p>
      )}
    </div>
  );
}
