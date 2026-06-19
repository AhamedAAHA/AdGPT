"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CreativeAnalysis } from "@/types";

const ANALYSIS_STEPS = [
  "Product detected",
  "Main subject found",
  "Brand colors extracted",
  "Text regions detected",
  "Audience analyzed",
  "AI neural processing",
];

interface AnalysisPanelProps {
  isAnalyzing: boolean;
  analysisStep: number;
  analysis: CreativeAnalysis | null;
  error?: string | null;
}

export function AnalysisPanel({
  isAnalyzing,
  analysisStep,
  analysis,
  error,
}: AnalysisPanelProps) {
  if (!isAnalyzing && !analysis && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
        {error
          ? "Analysis failed"
          : isAnalyzing
            ? "Analyzing creative..."
            : "Analysis complete"}
      </h3>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-300">
          {error}
          <p className="text-xs text-red-400/80 mt-2">
            Fix .env.local → restart <code className="font-mono">npm run dev</code>
          </p>
        </div>
      )}

      <div className="space-y-2">
        {ANALYSIS_STEPS.map((step, i) => {
          const done = isAnalyzing ? i < analysisStep : true;
          const active = isAnalyzing && i === analysisStep;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  done
                    ? "bg-cyan-500/20 text-cyan-400"
                    : active
                      ? "bg-purple-500/20 text-purple-400 animate-pulse"
                      : "bg-white/5 text-muted"
                }`}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-sm ${done ? "text-foreground" : "text-muted"}`}
              >
                {step}
                {done && analysis && i === 0 && `: ${analysis.product}`}
              </span>
            </motion.div>
          );
        })}
      </div>

      {analysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10"
        >
          <div>
            <p className="text-xs text-muted uppercase">Target Audience</p>
            <p className="text-sm font-medium">{analysis.audience}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Recommended Style</p>
            <p className="text-sm font-medium">{analysis.style}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Hook Type</p>
            <p className="text-sm font-medium">{analysis.hookType}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase">Brand Colors</p>
            <div className="flex gap-1 mt-1">
              {analysis.colors.map((c) => (
                <div
                  key={c}
                  className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
