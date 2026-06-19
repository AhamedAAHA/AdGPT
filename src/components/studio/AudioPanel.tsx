"use client";

import { motion } from "framer-motion";
import type { BrandDna } from "@/types";
import { VOICE_STYLES, MUSIC_MOODS } from "@/types";
import { cn } from "@/lib/utils";

interface AudioPanelProps {
  brandDna: BrandDna | null;
  voiceStyle: string;
  musicMood: string;
  onVoiceChange: (style: string) => void;
  onMusicChange: (mood: string) => void;
  voiceEnabled: boolean;
  musicEnabled: boolean;
  onVoiceToggle: (v: boolean) => void;
  onMusicToggle: (v: boolean) => void;
}

export function AudioPanel({
  brandDna: _brandDna,
  voiceStyle,
  musicMood,
  onVoiceChange,
  onMusicChange,
  voiceEnabled,
  musicEnabled,
  onVoiceToggle,
  onMusicToggle,
}: AudioPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5 space-y-4"
    >
      <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
        Audio Layer
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Voice-over</p>
          <button
            type="button"
            onClick={() => onVoiceToggle(!voiceEnabled)}
            className={cn(
              "w-10 h-5 rounded-full transition-colors cursor-pointer relative",
              voiceEnabled ? "bg-cyan-500" : "bg-white/10"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
                voiceEnabled ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
        {voiceEnabled && (
          <div className="grid grid-cols-2 gap-2">
            {VOICE_STYLES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onVoiceChange(v.id)}
                className={cn(
                  "p-2 rounded-lg border text-xs transition-all cursor-pointer",
                  voiceStyle === v.id
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-white/10 hover:bg-white/5"
                )}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Background Music</p>
          <button
            type="button"
            onClick={() => onMusicToggle(!musicEnabled)}
            className={cn(
              "w-10 h-5 rounded-full transition-colors cursor-pointer relative",
              musicEnabled ? "bg-purple-500" : "bg-white/10"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
                musicEnabled ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
        {musicEnabled && (
          <div className="grid grid-cols-3 gap-2">
            {MUSIC_MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onMusicChange(m.id)}
                className={cn(
                  "p-2 rounded-lg border text-xs transition-all cursor-pointer",
                  musicMood === m.id
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/10 hover:bg-white/5"
                )}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
