import type { Beat, TranscriptWord } from "@/types";
import {
  tokenizeScript,
} from "@/lib/transcript-reconcile";
import { MIN_MS_PER_WORD } from "@/lib/pacing";

const LEAD_IN_MS = 120;

/** Scale word timings so the last word ends near the real audio length */
export function stretchWordTimingsToDuration(
  words: TranscriptWord[],
  audioDurationMs: number
): TranscriptWord[] {
  if (!words.length || audioDurationMs <= 0) return words;

  const lastEnd = words[words.length - 1].endMs;
  if (lastEnd <= 0 || lastEnd >= audioDurationMs * 0.97) return words;

  const targetEnd = Math.max(audioDurationMs - 200, lastEnd);
  const scale = targetEnd / lastEnd;

  return words.map((word) => ({
    ...word,
    startMs: Math.round(word.startMs * scale),
    endMs: Math.round(word.endMs * scale),
  }));
}

/** Minimum on-screen duration so karaoke highlight is readable */
export function padWordTimingsForDisplay(
  words: TranscriptWord[],
  minWordMs = 140
): TranscriptWord[] {
  if (!words.length) return words;

  return words.map((word, index) => {
    const minEnd = word.startMs + minWordMs;
    const nextStart = words[index + 1]?.startMs;
    const endMs = Math.min(
      nextStart != null ? nextStart - 20 : minEnd,
      Math.max(word.endMs, minEnd)
    );
    return { ...word, endMs: Math.max(word.startMs + 40, endMs) };
  });
}

function divideWordsAcrossBeats(
  words: TranscriptWord[],
  beatCount: number
): TranscriptWord[][] {
  if (!words.length || beatCount <= 0) return [];

  const chunks: TranscriptWord[][] = Array.from({ length: beatCount }, () => []);
  const wordsPerBeat = Math.ceil(words.length / beatCount);

  for (let i = 0; i < words.length; i++) {
    const beatIdx = Math.min(Math.floor(i / wordsPerBeat), beatCount - 1);
    chunks[beatIdx].push(words[i]);
  }

  return chunks;
}

/** Spread beats across the full voiceover — each beat holds a slice of the transcript */
export function alignBeatsToTranscript(
  beats: Beat[],
  words: TranscriptWord[],
  script?: string
): Beat[] {
  if (!words.length || !beats.length) return beats;

  const wordChunks = divideWordsAcrossBeats(words, beats.length);

  return beats.map((beat, beatIndex) => {
    const chunk = wordChunks[beatIndex];
    if (!chunk?.length) return beat;

    return {
      ...beat,
      startMs: chunk[0].startMs,
      endMs: chunk[chunk.length - 1].endMs,
      caption: { ...beat.caption, words: chunk },
    };
  });
}

/** Map user's script words onto ASR timing anchors — text always comes from the script */
export function captionsFromScript(
  script: string,
  audioDurationMs: number,
  asrWords?: TranscriptWord[]
): TranscriptWord[] {
  const tokens = tokenizeScript(script);
  if (!tokens.length) return [];

  if (!asrWords?.length) {
    return estimateWordTimingsFromScript(script, audioDurationMs);
  }

  const n = tokens.length;
  const m = asrWords.length;

  return tokens.map((text, i) => {
    const startIdx = Math.min(Math.floor((i / n) * m), m - 1);
    const endIdx = Math.min(
      Math.max(startIdx, Math.ceil(((i + 1) / n) * m) - 1),
      m - 1
    );
    return {
      text,
      startMs: asrWords[startIdx].startMs,
      endMs: asrWords[endIdx].endMs,
    };
  });
}

/** Even word spacing from TTS duration when Speechmatics is unavailable */
export function estimateWordTimingsFromScript(
  script: string,
  audioDurationMs: number
): TranscriptWord[] {
  const tokens = tokenizeScript(script);
  if (!tokens.length || audioDurationMs <= 0) return [];

  const minByWords = tokens.length * MIN_MS_PER_WORD;
  const totalMs = Math.max(audioDurationMs, minByWords + LEAD_IN_MS + 200);
  const speakableMs = totalMs - LEAD_IN_MS - 200;
  const msPerWord = speakableMs / tokens.length;

  return tokens.map((text, index) => {
    const startMs = Math.round(LEAD_IN_MS + index * msPerWord);
    const endMs = Math.round(LEAD_IN_MS + (index + 1) * msPerWord);
    return { text, startMs, endMs };
  });
}

export function resolveDisplayCaptions(
  script: string | undefined,
  transcriptWords: TranscriptWord[],
  beats: Beat[],
  audioDurationMs: number
): TranscriptWord[] {
  const durationMs =
    audioDurationMs ||
    transcriptWords.at(-1)?.endMs ||
    beats.at(-1)?.endMs ||
    30_000;

  if (script?.trim()) {
    const timingHints = transcriptWords.length
      ? transcriptWords
      : beats.flatMap((beat) => beat.caption.words ?? []);
    return padWordTimingsForDisplay(
      captionsFromScript(
        script,
        durationMs,
        timingHints.length ? timingHints : undefined
      )
    );
  }

  if (transcriptWords.length) return transcriptWords;
  return beats.flatMap((beat) => beat.caption.words ?? []);
}

export function syncBeatsAndCaptionsToAudio(
  beats: Beat[],
  script: string,
  audioDurationMs: number,
  words?: TranscriptWord[]
): { beats: Beat[]; words: TranscriptWord[]; durationMs: number } {
  const rawWords = captionsFromScript(script, audioDurationMs, words);

  const stretchedWords = stretchWordTimingsToDuration(rawWords, audioDurationMs);

  const displayWords = padWordTimingsForDisplay(stretchedWords);

  const alignedBeats = beats.length
    ? alignBeatsToTranscript(beats, displayWords, script)
    : beats;

  const durationMs = getTotalDurationMs(
    displayWords,
    Math.max(audioDurationMs, alignedBeats.at(-1)?.endMs ?? 0)
  );

  return { beats: alignedBeats, words: displayWords, durationMs };
}

export function generateSRT(words: TranscriptWord[], wordsPerCue: number = 4): string {
  if (!words.length) return "";

  const cues: { startMs: number; endMs: number; text: string }[] = [];

  for (let i = 0; i < words.length; i += wordsPerCue) {
    const chunk = words.slice(i, i + wordsPerCue);
    cues.push({
      startMs: chunk[0].startMs,
      endMs: chunk[chunk.length - 1].endMs,
      text: chunk.map((w) => w.text).join(" "),
    });
  }

  return cues
    .map((cue, idx) => {
      return `${idx + 1}\n${msToSrtTime(cue.startMs)} --> ${msToSrtTime(cue.endMs)}\n${cue.text}\n`;
    })
    .join("\n");
}

function msToSrtTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const msRem = ms % 1000;
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(msRem, 3)}`;
}

export function getTotalDurationMs(words: TranscriptWord[], fallbackMs: number): number {
  if (!words.length) return fallbackMs;
  return Math.max(fallbackMs, words[words.length - 1].endMs + 800);
}
