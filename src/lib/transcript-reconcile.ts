import type { TranscriptWord } from "@/types";

/** Script tokens for caption sync (punctuation stripped, brand names kept whole) */
export function tokenizeScript(script: string): string[] {
  return script
    .replace(/[—–]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length < 3 || b.length < 3) return false;

  let diff = 0;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 1) return false;
  }
  return true;
}

/** Strict match — avoids "management" matching "managementstilljuggling..." */
function tokensMatch(scriptToken: string, heard: string): boolean {
  const a = normalizeToken(scriptToken);
  const b = normalizeToken(heard);
  if (!a || !b) return false;
  if (a === b) return true;

  if (b.length > a.length * 1.35 || a.length > b.length * 1.35) {
    return false;
  }

  return editDistanceAtMostOne(a, b);
}

function combinedAsrText(words: TranscriptWord[], from: number, count: number): string {
  return words
    .slice(from, from + count)
    .map((w) => normalizeToken(w.text))
    .join("");
}

function combinedMatchesScript(scriptToken: string, combined: string): boolean {
  const a = normalizeToken(scriptToken);
  const b = combined;
  if (!a || !b) return false;
  if (a === b) return true;
  return editDistanceAtMostOne(a, b);
}

/**
 * Replace ASR spellings (e.g. "bis" + "me") with script text ("BISMI")
 * while keeping Speechmatics timings.
 */
export function reconcileTranscriptWithScript(
  script: string,
  asrWords: TranscriptWord[]
): TranscriptWord[] {
  const scriptTokens = tokenizeScript(script);
  if (!scriptTokens.length) return asrWords;
  if (!asrWords.length) {
    return estimateWordsFromScriptOnly(scriptTokens);
  }

  const result: TranscriptWord[] = [];
  let asrIdx = 0;

  for (const scriptToken of scriptTokens) {
    const normScript = normalizeToken(scriptToken);
    if (!normScript) continue;

    if (asrIdx >= asrWords.length) break;

    let matched = false;

    for (let span = 1; span <= 4 && asrIdx + span <= asrWords.length; span++) {
      const slice = asrWords.slice(asrIdx, asrIdx + span);
      const combined = combinedAsrText(asrWords, asrIdx, span);

      const singleMatch =
        span === 1 && tokensMatch(scriptToken, slice[0].text);
      const combinedMatch =
        span > 1 && combinedMatchesScript(scriptToken, combined);

      if (singleMatch || combinedMatch) {
        result.push({
          text: scriptToken,
          startMs: slice[0].startMs,
          endMs: slice[slice.length - 1].endMs,
        });
        asrIdx += span;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const heard = asrWords[asrIdx];
      result.push({
        text: scriptToken,
        startMs: heard.startMs,
        endMs: heard.endMs,
      });
      asrIdx++;
    }
  }

  return result.length ? result : asrWords;
}

function estimateWordsFromScriptOnly(tokens: string[]): TranscriptWord[] {
  const msPerWord = 350;
  return tokens.map((text, index) => ({
    text,
    startMs: index * msPerWord,
    endMs: (index + 1) * msPerWord,
  }));
}

/** Phonetic spellings so TTS reads brand names correctly */
const TTS_PRONUNCIATIONS: Record<string, string> = {
  bismi: "Bizmee",
};

export function prepareScriptForTts(script: string): string {
  return script.replace(/\b([A-Za-z]{3,})\b/g, (word) => {
    const key = word.toLowerCase();
    if (TTS_PRONUNCIATIONS[key]) {
      return TTS_PRONUNCIATIONS[key];
    }
    if (word === word.toUpperCase() && word.length >= 3 && /^[A-Z]+$/.test(word)) {
      return word.charAt(0) + word.slice(1).toLowerCase();
    }
    return word;
  });
}
