"use client";

import { motion } from "framer-motion";
import type { QualityScores } from "@/types";

interface QualityScorePanelProps {
  scores: QualityScores;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted capitalize">{label}</span>
        <span className="font-mono text-cyan-400">{value}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full neon-gradient"
        />
      </div>
    </div>
  );
}

export function QualityScorePanel({ scores }: QualityScorePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          Creative Score
        </h3>
        <div className="text-2xl font-bold neon-gradient-text">
          {scores.overall}/100
        </div>
      </div>
      <div className="space-y-3">
        <ScoreBar label="Hook" value={scores.hook} />
        <ScoreBar label="Clarity" value={scores.clarity} />
        <ScoreBar label="CTA" value={scores.cta} />
        <ScoreBar label="Brand" value={scores.brand} />
      </div>
    </motion.div>
  );
}
