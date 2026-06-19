"use client";

import type { Beat, MotionType } from "@/types";

const SUBJECT_OPTIONS: MotionType["subject"][] = [
  "slow-zoom",
  "ken-burns",
  "3d-rotation",
  "light-sweep",
];

const TEXT_OPTIONS: MotionType["text"][] = [
  "fade-up",
  "word-reveal",
  "bounce",
  "typewriter",
];

const BG_OPTIONS: MotionType["background"][] = [
  "static",
  "parallax",
  "particles",
  "blur-transition",
];

interface BeatEditorProps {
  beat: Beat;
  beatIndex: number;
  totalDurationMs: number;
  onUpdate: (index: number, updates: Partial<Beat>) => void;
  compact?: boolean;
}

export function BeatEditor({
  beat,
  beatIndex,
  totalDurationMs,
  onUpdate,
  compact = false,
}: BeatEditorProps) {
  const captionText = beat.caption.lines.join("\n");

  const content = (
    <>
      <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
        Edit Beat — {beat.role}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
            Start (ms)
          </label>
          <input
            type="number"
            min={0}
            max={beat.endMs - 500}
            value={beat.startMs}
            onChange={(e) =>
              onUpdate(beatIndex, { startMs: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
            End (ms)
          </label>
          <input
            type="number"
            min={beat.startMs + 500}
            max={totalDurationMs}
            value={beat.endMs}
            onChange={(e) =>
              onUpdate(beatIndex, { endMs: Number(e.target.value) })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
          Headline
        </label>
        <input
          type="text"
          value={beat.headline}
          onChange={(e) =>
            onUpdate(beatIndex, { headline: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
          Captions (one line per row)
        </label>
        <textarea
          value={captionText}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter(Boolean);
            onUpdate(beatIndex, {
              caption: { ...beat.caption, lines: lines.length ? lines : [""] },
            });
          }}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm resize-none focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
            Subject motion
          </label>
        <select
          value={beat.motion.subject}
          onChange={(e) =>
            onUpdate(beatIndex, {
              motion: {
                ...beat.motion,
                subject: e.target.value as MotionType["subject"],
              },
            })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {SUBJECT_OPTIONS.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0f]">
              {o}
            </option>
          ))}
        </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
            Text animation
          </label>
        <select
          value={beat.motion.text}
          onChange={(e) =>
            onUpdate(beatIndex, {
              motion: {
                ...beat.motion,
                text: e.target.value as MotionType["text"],
              },
            })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {TEXT_OPTIONS.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0f]">
              {o}
            </option>
          ))}
        </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase text-cyber-muted tracking-wider">
          Background
        </label>
        <select
          value={beat.motion.background}
          onChange={(e) =>
            onUpdate(beatIndex, {
              motion: {
                ...beat.motion,
                background: e.target.value as MotionType["background"],
              },
            })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {BG_OPTIONS.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0f]">
              {o}
            </option>
          ))}
        </select>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="rounded-xl glass-panel p-3 space-y-3">{content}</div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-3">{content}</div>
  );
}
