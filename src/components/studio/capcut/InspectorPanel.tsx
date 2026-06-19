"use client";

import { useState } from "react";
import type { Beat, VisualSource } from "@/types";
import { BeatEditor } from "@/components/studio/BeatEditor";
import { AudioPanel } from "@/components/studio/AudioPanel";
import { QualityScorePanel } from "@/components/studio/QualityScorePanel";
import { AbTestingPanel } from "@/components/studio/AbTestingPanel";
import type { BrandDna, QualityScores, AbVariant } from "@/types";
import { cn } from "@/lib/utils";

const VISUAL_SOURCES: { id: VisualSource; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "broll", label: "B-Roll" },
  { id: "ai-video", label: "AI Video" },
  { id: "typography", label: "Text" },
];

type InspectorTab = "beat" | "audio" | "scores";

interface InspectorPanelProps {
  beat: Beat | null;
  beatIndex: number;
  totalDurationMs: number;
  onUpdateBeat: (index: number, updates: Partial<Beat>) => void;
  onVisualSourceChange: (index: number, source: VisualSource) => void;
  brandDna: BrandDna | null;
  scores: QualityScores;
  abVariants: AbVariant[];
  audioProps: React.ComponentProps<typeof AudioPanel>;
  script: string;
  onScriptChange: (script: string) => void;
  activeTab?: InspectorTab;
  onTabChange?: (tab: InspectorTab) => void;
}

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "beat", label: "Beat" },
  { id: "audio", label: "Audio" },
  { id: "scores", label: "Scores" },
];

export function InspectorPanel({
  beat,
  beatIndex,
  totalDurationMs,
  onUpdateBeat,
  onVisualSourceChange,
  scores,
  abVariants,
  audioProps,
  script,
  onScriptChange,
  activeTab: controlledTab,
  onTabChange,
}: InspectorPanelProps) {
  const [internalTab, setInternalTab] = useState<InspectorTab>("beat");
  const tab = controlledTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  return (
    <aside className="w-[min(100vw,320px)] shrink-0 border-l border-cyan-500/10 cyber-panel rounded-none flex flex-col min-h-0 overflow-hidden">
      <div className="shrink-0 border-b border-cyan-500/10">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
          Inspector
        </p>
        <div className="flex px-2 pb-2 gap-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-colors cursor-pointer",
                tab === id
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 space-y-3">
        {tab === "beat" && (
          <>
            {!beat && (
              <p className="text-xs text-white/50 text-center py-8">
                Select a clip on the timeline
              </p>
            )}
            {beat && (
              <>
                <div className="rounded-xl glass-panel p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-cyan-400/80">
                    Clip source
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {VISUAL_SOURCES.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onVisualSourceChange(beatIndex, id)}
                        className={cn(
                          "px-2 py-2 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer",
                          (beat.visual?.source ?? "hero") === id
                            ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                            : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {beat.visual?.brollQuery && (
                    <p className="text-[9px] text-white/40 truncate">
                      B-roll: {beat.visual.brollQuery}
                    </p>
                  )}
                </div>

                <BeatEditor
                  beat={beat}
                  beatIndex={beatIndex}
                  totalDurationMs={totalDurationMs}
                  onUpdate={onUpdateBeat}
                  compact
                />
              </>
            )}

            <div className="rounded-xl glass-panel p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-cyan-400/80">
                Script
              </p>
              <textarea
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                rows={5}
                className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs resize-none focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </>
        )}

        {tab === "audio" && <AudioPanel {...audioProps} />}

        {tab === "scores" && (
          <>
            <QualityScorePanel scores={scores} />
            <AbTestingPanel variants={abVariants} />
          </>
        )}
      </div>
    </aside>
  );
}

export type { InspectorTab };
