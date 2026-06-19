"use client";

import Link from "next/link";
import { ChevronLeft, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioShellProps {
  step: "upload" | "strategy" | "studio";
  children: React.ReactNode;
  statusText?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

const STEP_LABELS = {
  upload: "Upload",
  strategy: "Strategy",
  studio: "Editor",
};

export function StudioShell({
  step,
  children,
  statusText,
  actions,
  onBack,
}: StudioShellProps) {
  return (
    <div className="fixed inset-0 z-10 flex flex-col h-dvh text-white">
      <header className="shrink-0 cyber-panel border-x-0 border-t-0 rounded-none px-4 md:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Link
                href="/"
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
              >
                <ChevronLeft size={18} />
              </Link>
            )}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg cyber-logo-box flex items-center justify-center">
                <Cpu size={16} className="text-cyber-cyan" />
              </div>
              <span className="text-sm font-bold hidden sm:inline">
                <span className="text-white">Ad</span>
                <span className="text-cyan-400">GPT</span>
              </span>
            </Link>
            <span className="text-white/20 hidden sm:inline">/</span>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400/90">
              Studio
            </span>
            <span className="text-white/20 hidden sm:inline">/</span>
            <span className="text-sm text-white/60 truncate">
              {STEP_LABELS[step]}
            </span>
            {statusText && (
              <span className="text-[10px] font-mono text-cyan-400/70 animate-pulse hidden md:inline truncate">
                {statusText}
              </span>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}

export function StudioStepContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto px-4 md:px-6 py-6 pb-28",
        className
      )}
    >
      {children}
    </div>
  );
}
