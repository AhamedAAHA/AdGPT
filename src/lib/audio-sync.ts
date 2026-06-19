import { syncBeatsAndCaptionsToAudio, generateSRT } from "@/lib/caption-sync";

export function getAudioDurationMs(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const durationMs = Math.round((audio.duration || 0) * 1000);
      URL.revokeObjectURL(url);
      if (durationMs > 0) resolve(durationMs);
      else reject(new Error("Audio duration unavailable"));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read audio duration"));
    };
    audio.src = url;
  });
}

const warmedAudio = new Set<string>();

export function preloadVoiceOver(url: string): void {
  if (typeof document === "undefined" || !url || warmedAudio.has(url)) return;
  warmedAudio.add(url);

  const audio = document.createElement("audio");
  audio.preload = "auto";
  audio.src = url;
  audio.load();
}

export async function buildCaptionSyncFromTts(
  blob: Blob,
  script: string,
  beats: import("@/types").Beat[] | undefined,
  fallbackDurationMs?: number
) {
  const audioDurationMs = await getAudioDurationMs(blob).catch(
    () => fallbackDurationMs ?? 20_000
  );

  try {
    const base64 = await blobToBase64(blob);
    const syncRes = await fetch("/api/sync-captions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: "audio/mpeg",
        beats,
        durationMs: audioDurationMs,
        script,
      }),
    });

    if (syncRes.ok) {
      const data = await syncRes.json();
      return syncBeatsAndCaptionsToAudio(
        data.beats ?? beats ?? [],
        script,
        audioDurationMs,
        data.words
      );
    }
  } catch (error) {
    console.warn("Speechmatics sync unavailable, using estimated timings:", error);
  }

  return syncBeatsAndCaptionsToAudio(beats ?? [], script, audioDurationMs);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function captionSrtFromWords(
  words: import("@/types").TranscriptWord[]
): string {
  return generateSRT(words);
}
