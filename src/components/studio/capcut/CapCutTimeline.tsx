"use client";

import { formatMs } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Beat } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  hook: "bg-cyan-500",
  problem: "bg-purple-500",
  benefit: "bg-pink-500",
  proof: "bg-blue-500",
  cta: "bg-emerald-500",
};

const SOURCE_LABELS: Record<string, string> = {
  hero: "IMG",
  broll: "B-Roll",
  "ai-video": "AI",
  typography: "TXT",
};

interface CapCutTimelineProps {
  beats: Beat[];
  activeIndex: number;
  onBeatSelect: (index: number) => void;
  totalDurationMs: number;
}

export function CapCutTimeline({
  beats,
  activeIndex,
  onBeatSelect,
  totalDurationMs,
}: CapCutTimelineProps) {
  if (!beats.length) return null;

  const ticks = 5;
  const tickStep = totalDurationMs / ticks;

  return (
    <div className="shrink-0 border-t border-cyan-500/10 cyber-panel rounded-none select-none">
      <div className="flex items-center gap-2 px-3 py-1 border-b border-cyan-500/10">
        <span className="text-[10px] uppercase tracking-widest text-white/40 w-16">
          Video
        </span>
        <span className="text-[10px] text-white/30">Drag clips · Click to edit</span>
      </div>

      <div className="px-3 py-2">
        <div className="flex justify-between mb-1 px-16">
          {Array.from({ length: ticks + 1 }).map((_, i) => (
            <span key={i} className="text-[9px] font-mono text-white/30">
              {formatMs(i * tickStep)}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5 h-16 relative rounded-lg overflow-hidden bg-black/30 border border-cyan-500/10">
          {beats.map((beat, i) => {
            const left = (beat.startMs / totalDurationMs) * 100;
            const width = ((beat.endMs - beat.startMs) / totalDurationMs) * 100;
            const isActive = i === activeIndex;
            const src = beat.visual?.source ?? "hero";

            return (
              <button
                key={beat.id}
                type="button"
                onClick={() => onBeatSelect(i)}
                className={cn(
                  "absolute top-1 bottom-1 rounded-md overflow-hidden cursor-pointer transition-all border",
                  isActive
                    ? "border-cyan-400 ring-1 ring-cyan-400/50 z-10"
                    : "border-white/10 hover:border-white/25"
                )}
                style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
              >
                <div
                  className={cn(
                    "h-full w-full opacity-90 flex flex-col justify-end p-1",
                    ROLE_COLORS[beat.role] ?? "bg-gray-600"
                  )}
                >
                  <span className="text-[8px] font-bold text-white uppercase truncate">
                    {beat.role}
                  </span>
                  <span className="text-[7px] text-white/70">
                    {SOURCE_LABELS[src] ?? "IMG"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40 w-16">
            Audio
          </span>
          <div className="flex-1 h-6 rounded bg-purple-500/20 border border-purple-500/30 flex items-center px-2">
            <span className="text-[9px] text-purple-300">Voice-over + Music</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] uppercase tracking-widest text-white/40 w-16">
            Text
          </span>
          <div className="flex-1 h-5 rounded bg-cyan-500/15 border border-cyan-500/25 flex items-center px-2">
            <span className="text-[9px] text-cyan-300">Synced captions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
