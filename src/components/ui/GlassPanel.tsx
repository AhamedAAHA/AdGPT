import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "purple";
}

export function GlassPanel({
  children,
  className,
  variant = "default",
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6",
        variant === "purple" && "glass-panel-purple",
        className
      )}
    >
      {children}
    </div>
  );
}
