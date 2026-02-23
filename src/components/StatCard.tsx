import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  gradient?: "hero" | "success" | "gamification" | "badge";
  delay?: number;
}

const gradientClasses = {
  hero: "gradient-hero",
  success: "gradient-success",
  gamification: "gradient-gamification",
  badge: "gradient-badge",
};

export default function StatCard({ title, value, subtitle, icon, gradient = "hero", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${gradientClasses[gradient]} flex items-center justify-center text-primary-foreground`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
