"use client";

import { motion } from "framer-motion";
import { VERSION_OPTIONS } from "@/types";
import type { VersionStyle } from "@/types";
import { cn } from "@/lib/utils";

interface VersionSelectorProps {
  selected: VersionStyle;
  onSelect: (version: VersionStyle) => void;
}

export function VersionSelector({ selected, onSelect }: VersionSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
        Creative Version
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {VERSION_OPTIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={cn(
              "text-left p-3 rounded-xl border transition-all cursor-pointer",
              selected === v.id
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-white/10 hover:bg-white/5"
            )}
          >
            <p className="text-sm font-medium">
              Version {String.fromCharCode(65 + VERSION_OPTIONS.indexOf(v))}:{" "}
              {v.name}
            </p>
            <p className="text-xs text-muted mt-0.5">{v.description}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
