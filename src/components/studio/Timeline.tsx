"use client";

import { motion } from "framer-motion";
import type { Beat } from "@/types";
import { formatMs } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimelineProps {
  beats: Beat[];
  activeIndex: number;
  onBeatSelect: (index: number) => void;
  totalDurationMs: number;
}

const ROLE_COLORS: Record<string, string> = {
  hook: "from-cyan-500 to-cyan-400",
  problem: "from-purple-500 to-purple-400",
  benefit: "from-pink-500 to-pink-400",
  proof: "from-blue-500 to-blue-400",
  cta: "from-green-500 to-green-400",
};

export function Timeline({
  beats,
  activeIndex,
  onBeatSelect,
  totalDurationMs,
}: TimelineProps) {
  if (!beats.length) return null;

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          Timeline
        </h3>
        <span className="text-xs text-muted">
          {formatMs(totalDurationMs)} total
        </span>
      </div>

      <div className="relative h-12 bg-white/5 rounded-xl overflow-hidden">
        {beats.map((beat, i) => {
          const left = (beat.startMs / totalDurationMs) * 100;
          const width = ((beat.endMs - beat.startMs) / totalDurationMs) * 100;
          const isActive = i === activeIndex;

          return (
            <motion.button
              key={beat.id}
              onClick={() => onBeatSelect(i)}
              className={cn(
                "absolute top-1 bottom-1 rounded-lg cursor-pointer transition-all",
                isActive && "ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent z-10"
              )}
              style={{
                left: `${left}%`,
                width: `${width}%`,
              }}
              whileHover={{ scaleY: 1.1 }}
            >
              <div
                className={cn(
                  "w-full h-full rounded-lg bg-gradient-to-r opacity-80",
                  ROLE_COLORS[beat.role] ?? "from-gray-500 to-gray-400"
                )}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {beat.role}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 px-1">
        {beats.map((beat, i) => (
          <button
            key={beat.id}
            onClick={() => onBeatSelect(i)}
            className={cn(
              "text-[10px] transition-colors cursor-pointer",
              i === activeIndex ? "text-cyan-400" : "text-muted hover:text-foreground"
            )}
          >
            {formatMs(beat.startMs)}
          </button>
        ))}
      </div>
    </div>
  );
}
