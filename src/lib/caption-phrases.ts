import type { TranscriptWord } from "@/types";

export type CaptionPhrase = {
  text: string;
  words: TranscriptWord[];
  startMs: number;
  endMs: number;
};

/** Group synced words into readable subtitle phrases */
export function buildCaptionPhrases(
  words: TranscriptWord[],
  maxWordsPerPhrase = 6
): CaptionPhrase[] {
  if (!words.length) return [];

  const phrases: CaptionPhrase[] = [];
  let buffer: TranscriptWord[] = [];

  const flush = () => {
    if (!buffer.length) return;
    phrases.push({
      text: buffer.map((w) => w.text).join(" "),
      words: buffer,
      startMs: buffer[0].startMs,
      endMs: buffer[buffer.length - 1].endMs,
    });
    buffer = [];
  };

  for (const word of words) {
    buffer.push(word);
    const endsSentence = /[.!?]$/.test(word.text);
    if (buffer.length >= maxWordsPerPhrase || endsSentence) {
      flush();
    }
  }
  flush();

  return phrases;
}
