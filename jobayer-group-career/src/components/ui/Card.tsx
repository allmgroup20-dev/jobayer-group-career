"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, variant = "default", hover = false, onClick }: CardProps) {
  const variants = {
    default: "bg-bg-card border border-border shadow-sm",
    glass: "bg-white/80 backdrop-blur-lg border border-white/20 shadow-lg",
    gradient: "gradient-primary text-white shadow-lg",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, color = "text-action" }: { label: string; value: string; icon?: React.ReactNode; color?: string }) {
  return (
    <Card className="flex items-center gap-4">
      {icon && <div className={`w-12 h-12 rounded-xl ${color} bg-current/10 flex items-center justify-center`}>{icon}</div>}
      <div>
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
      </div>
    </Card>
  );
}
