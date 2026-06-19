import type { Beat, TranscriptWord } from "@/types";

/** Slower narration (OpenAI TTS supports 0.25–4.0, default 1) */
export const TTS_SPEECH_SPEED = 0.75;

export const MIN_MS_PER_WORD = 380;
export const MIN_BEAT_DURATION_MS = 5000;
export const COMPOSITION_END_PAD_MS = 2000;

export function getCompositionDurationMs(options: {
  durationMs?: number;
  beats?: Beat[];
  transcriptWords?: TranscriptWord[];
  voiceOverDurationMs?: number | null;
}): number {
  const beatEnd = Math.max(0, ...(options.beats ?? []).map((b) => b.endMs));
  const wordEnd = options.transcriptWords?.at(-1)?.endMs ?? 0;
  const audioMs = options.voiceOverDurationMs ?? 0;

  return (
    Math.max(
      options.durationMs ?? 0,
      beatEnd,
      wordEnd,
      audioMs
    ) + COMPOSITION_END_PAD_MS
  );
}
