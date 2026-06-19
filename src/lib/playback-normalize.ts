import type { Beat } from "@/types";
import { MIN_BEAT_DURATION_MS } from "@/lib/pacing";

export function beatsAreAudioSynced(beats: Beat[]): boolean {
  return beats.some((beat) => (beat.caption.words?.length ?? 0) > 0);
}

function applyMotionFixes(beat: Beat): Beat {
  return {
    ...beat,
    motion: {
      ...beat.motion,
      transition: "cut",
      subject:
        beat.motion.subject === "3d-rotation"
          ? "slow-zoom"
          : beat.motion.subject,
    },
  };
}

/** Smooth preview/export: pack beats unless audio-synced timings must be kept */
export function normalizeBeatsForPlayback(
  beats: Beat[],
  options?: { lockTimeline?: boolean }
): Beat[] {
  if (!beats.length) return beats;

  const sorted = [...beats].sort((a, b) => a.startMs - b.startMs);

  if (options?.lockTimeline || beatsAreAudioSynced(beats)) {
    return sorted.map(applyMotionFixes);
  }

  let timelineEnd = 0;

  return sorted.map((beat) => {
    const beatDuration = Math.max(beat.endMs - beat.startMs, MIN_BEAT_DURATION_MS);
    const startMs = timelineEnd;
    const endMs = startMs + beatDuration;
    timelineEnd = endMs;

    return applyMotionFixes({
      ...beat,
      startMs,
      endMs,
    });
  });
}
