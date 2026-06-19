import type { TranscriptWord } from "@/types";

const DEFAULT_API_URL = "https://asr.api.speechmatics.com/v2";

export function isSpeechmaticsConfigured(): boolean {
  const key = process.env.SPEECHMATICS_API_KEY;
  return Boolean(key && !key.includes("your-") && key.length > 10);
}

function getApiBase(): string {
  return process.env.SPEECHMATICS_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type SMWordResult = {
  type: string;
  start_time?: number;
  end_time?: number;
  alternatives?: { content: string }[];
};

type SMTranscript = {
  results?: SMWordResult[];
};

export function parseSpeechmaticsWords(transcript: SMTranscript): TranscriptWord[] {
  if (!transcript.results) return [];

  return transcript.results
    .filter((r) => r.type === "word" && r.start_time != null && r.end_time != null)
    .map((r) => ({
      text: r.alternatives?.[0]?.content ?? "",
      startMs: Math.round((r.start_time ?? 0) * 1000),
      endMs: Math.round((r.end_time ?? 0) * 1000),
    }))
    .filter((w) => w.text.length > 0);
}

export function wordsToPlainText(words: TranscriptWord[]): string {
  return words.map((w) => w.text).join(" ");
}

async function pollJob(jobId: string, apiKey: string): Promise<void> {
  const base = getApiBase();
  const maxAttempts = 120;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${base}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Speechmatics job poll failed: ${res.status}`);
    }

    const data = (await res.json()) as { job: { status: string; errors?: { message: string }[] } };
    const status = data.job.status;

    if (status === "done") return;
    if (status === "rejected" || status === "deleted") {
      const msg = data.job.errors?.[0]?.message ?? status;
      throw new Error(`Speechmatics job ${status}: ${msg}`);
    }

    await sleep(1500);
  }

  throw new Error("Speechmatics transcription timed out");
}

export async function transcribeAudioBuffer(
  buffer: Buffer,
  filename: string,
  language: string = "en"
): Promise<{ words: TranscriptWord[]; text: string; srt: string }> {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!isSpeechmaticsConfigured() || !apiKey) {
    throw new Error("Speechmatics API key not configured");
  }

  const base = getApiBase();
  const formData = new FormData();
  formData.append(
    "data_file",
    new Blob([new Uint8Array(buffer)], { type: guessMime(filename) }),
    filename
  );
  formData.append(
    "config",
    JSON.stringify({
      type: "transcription",
      transcription_config: {
        language,
        operating_point: "enhanced",
      },
    })
  );

  const createRes = await fetch(`${base}/jobs/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Speechmatics create job failed: ${createRes.status} ${errText}`);
  }

  const createData = (await createRes.json()) as { id: string };
  const jobId = createData.id;

  await pollJob(jobId, apiKey);

  const [jsonRes, srtRes] = await Promise.all([
    fetch(`${base}/jobs/${jobId}/transcript?format=json-v2`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),
    fetch(`${base}/jobs/${jobId}/transcript?format=srt`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    }),
  ]);

  if (!jsonRes.ok) {
    throw new Error(`Speechmatics transcript fetch failed: ${jsonRes.status}`);
  }

  const transcript = (await jsonRes.json()) as SMTranscript;
  const words = parseSpeechmaticsWords(transcript);
  const text = wordsToPlainText(words);
  const srt = srtRes.ok ? await srtRes.text() : "";

  return { words, text, srt };
}

function guessMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    webm: "audio/webm",
    ogg: "audio/ogg",
    mp4: "video/mp4",
  };
  return map[ext ?? ""] ?? "audio/mpeg";
}
