"use client";

import { motion } from "framer-motion";
import type { HookOption } from "@/types";
import { cn } from "@/lib/utils";

interface HookSelectorProps {
  hooks: HookOption[];
  selected: HookOption | null;
  onSelect: (hook: HookOption) => void;
  isLoading?: boolean;
}

export function HookSelector({
  hooks,
  selected,
  onSelect,
  isLoading,
}: HookSelectorProps) {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
          Generating hooks...
        </h3>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!hooks.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
        Choose your opening
      </h3>
      <div className="space-y-2">
        {hooks.map((hook) => (
          <button
            key={hook.id}
            onClick={() => onSelect(hook)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all cursor-pointer",
              selected?.id === hook.id
                ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                : "border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20"
            )}
          >
            <span className="mr-2">{hook.emoji}</span>
            <span className="text-sm font-medium">&ldquo;{hook.text}&rdquo;</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
