"use client";

import { motion } from "framer-motion";
import type { AbVariant } from "@/types";

interface AbTestingPanelProps {
  variants: AbVariant[];
}

export function AbTestingPanel({ variants }: AbTestingPanelProps) {
  if (!variants.length) return null;

  const sorted = [...variants].sort(
    (a, b) => b.engagementScore - a.engagementScore
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5 space-y-3"
    >
      <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
        A/B Variants
      </h3>
      <p className="text-xs text-muted">
        AI-estimated engagement scores based on short-form best practices
      </p>
      <div className="space-y-3">
        {sorted.map((variant, i) => (
          <div
            key={variant.id}
            className="p-4 rounded-xl border border-white/10 bg-white/3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Ad {i + 1}: {variant.name}
              </span>
              {i === 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 uppercase">
                  Top pick
                </span>
              )}
            </div>
            <p className="text-xs text-muted">&ldquo;{variant.hook}&rdquo;</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Engagement Score:</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full neon-gradient rounded-full"
                  style={{ width: `${variant.engagementScore}%` }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {variant.engagementScore}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
