"use client";

import {
  Music2,
  Type,
  Sparkles,
  ImageIcon,
  Clapperboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockClip, Beat, VisualSource } from "@/types";
import { VOICE_STYLES, MUSIC_MOODS } from "@/types";

export type MediaTab = "media" | "audio" | "text" | "effects" | "broll";

const TABS: { id: MediaTab; icon: typeof ImageIcon; label: string }[] = [
  { id: "media", icon: ImageIcon, label: "Media" },
  { id: "broll", icon: Clapperboard, label: "B-Roll" },
  { id: "audio", icon: Music2, label: "Audio" },
  { id: "text", icon: Type, label: "Text" },
  { id: "effects", icon: Sparkles, label: "FX" },
];

const VISUAL_SOURCES: { id: VisualSource; label: string }[] = [
  { id: "hero", label: "Hero Image" },
  { id: "broll", label: "Stock B-Roll" },
  { id: "ai-video", label: "AI Video" },
  { id: "typography", label: "Typography" },
];

interface MediaBinProps {
  activeTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  heroImageUrl?: string;
  stockClips?: StockClip[];
  onClipSelect?: (clip: StockClip) => void;
  activeBeat?: Beat | null;
  beatIndex?: number;
  onVisualSourceChange?: (index: number, source: VisualSource) => void;
  voiceStyle?: string;
  musicMood?: string;
  voiceEnabled?: boolean;
  musicEnabled?: boolean;
  onVoiceChange?: (style: string) => void;
  onMusicChange?: (mood: string) => void;
  onVoiceToggle?: (v: boolean) => void;
  onMusicToggle?: (v: boolean) => void;
  script?: string;
  onScriptChange?: (script: string) => void;
  onFocusInspector?: (section: "beat" | "audio" | "scores") => void;
}

export function MediaBin({
  activeTab,
  onTabChange,
  heroImageUrl,
  stockClips = [],
  onClipSelect,
  activeBeat,
  beatIndex = 0,
  onVisualSourceChange,
  voiceStyle = "energetic",
  musicMood = "trending",
  voiceEnabled = true,
  musicEnabled = true,
  onVoiceChange,
  onMusicChange,
  onVoiceToggle,
  onMusicToggle,
  script = "",
  onScriptChange,
  onFocusInspector,
}: MediaBinProps) {
  const handleTab = (id: MediaTab) => {
    onTabChange(id);
    if (id === "audio") onFocusInspector?.("audio");
    if (id === "text" || id === "effects") onFocusInspector?.("beat");
  };

  return (
    <div className="flex h-full min-h-0 border-r border-cyan-500/10 cyber-panel rounded-none shrink-0">
      <div className="w-14 flex flex-col items-center py-3 gap-1 border-r border-cyan-500/10 shrink-0 bg-black/20">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleTab(id)}
            title={label}
            className={cn(
              "w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer",
              activeTab === id
                ? "bg-cyan-500/15 text-cyan-400"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <Icon size={18} />
            <span className="text-[8px] uppercase tracking-wide">{label.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      <div className="w-52 flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-cyan-500/10 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
            {TABS.find((t) => t.id === activeTab)?.label}
          </p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
          {activeTab === "media" && heroImageUrl && (
            <div className="rounded-lg overflow-hidden border border-cyan-500/30 aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-cyan-300">
                Hero
              </span>
            </div>
          )}

          {activeTab === "broll" &&
            stockClips.map((clip) => (
              <button
                key={clip.id}
                type="button"
                onClick={() => onClipSelect?.(clip)}
                className="w-full rounded-lg overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-colors cursor-pointer text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={clip.thumbnail}
                  alt={clip.query}
                  className="w-full aspect-video object-cover"
                />
                <p className="text-[10px] text-white/50 px-2 py-1 truncate">{clip.query}</p>
              </button>
            ))}
          {activeTab === "broll" && !stockClips.length && (
            <p className="text-xs text-white/40 p-2">
              Add PEXELS_API_KEY for more clips. Fallback stock video is used automatically.
            </p>
          )}

          {activeTab === "audio" && (
            <div className="space-y-3 p-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Voice-over</span>
                <button
                  type="button"
                  onClick={() => onVoiceToggle?.(!voiceEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                    voiceEnabled ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      voiceEnabled ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              {voiceEnabled && (
                <div className="grid grid-cols-1 gap-1.5">
                  {VOICE_STYLES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onVoiceChange?.(v.id)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg border text-[10px] text-left cursor-pointer",
                        voiceStyle === v.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                          : "border-white/10 text-white/50 hover:bg-white/5"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-white/70">Music</span>
                <button
                  type="button"
                  onClick={() => onMusicToggle?.(!musicEnabled)}
                  className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                    musicEnabled ? "bg-purple-500" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      musicEnabled ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              {musicEnabled && (
                <div className="grid grid-cols-1 gap-1.5">
                  {MUSIC_MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onMusicChange?.(m.id)}
                      className={cn(
                        "px-2 py-1.5 rounded-lg border text-[10px] text-left cursor-pointer",
                        musicMood === m.id
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                          : "border-white/10 text-white/50 hover:bg-white/5"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "text" && (
            <textarea
              value={script}
              onChange={(e) => onScriptChange?.(e.target.value)}
              rows={10}
              placeholder="Edit script..."
              className="w-full px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-xs resize-none focus:outline-none focus:border-cyan-500/50"
            />
          )}

          {activeTab === "effects" && activeBeat && (
            <div className="space-y-2">
              <p className="text-[10px] text-white/50 uppercase">Clip: {activeBeat.role}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {VISUAL_SOURCES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onVisualSourceChange?.(beatIndex, id)}
                    className={cn(
                      "px-2 py-2 rounded-lg border text-[10px] text-left cursor-pointer",
                      (activeBeat.visual?.source ?? "hero") === id
                        ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                        : "border-white/10 text-white/50 hover:bg-white/5"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "effects" && !activeBeat && (
            <p className="text-xs text-white/40 p-2">Select a timeline clip first</p>
          )}
        </div>
      </div>
    </div>
  );
}
