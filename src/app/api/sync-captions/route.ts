import { NextRequest, NextResponse } from "next/server";
import { generateSRT, getTotalDurationMs, syncBeatsAndCaptionsToAudio } from "@/lib/caption-sync";
import { isSpeechmaticsConfigured, transcribeAudioBuffer } from "@/lib/speechmatics";
import type { Beat } from "@/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    if (!isSpeechmaticsConfigured()) {
      return NextResponse.json(
        { error: "Speechmatics API key not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { audioBase64, mimeType, beats, durationMs, script } = body as {
      audioBase64: string;
      mimeType?: string;
      beats?: Beat[];
      durationMs?: number;
      script?: string;
    };

    if (!audioBase64) {
      return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    }

    const buffer = Buffer.from(audioBase64, "base64");
    const ext = mimeType?.includes("wav") ? "audio.wav" : "audio.mp3";

    const { words, srt: speechmaticsSrt } = await transcribeAudioBuffer(
      buffer,
      ext,
      "en"
    );

    const synced = syncBeatsAndCaptionsToAudio(
      beats ?? [],
      script ?? "",
      durationMs ?? getTotalDurationMs(words, 20_000),
      words
    );

    const srt = speechmaticsSrt || generateSRT(synced.words);

    return NextResponse.json({
      words: synced.words,
      beats: synced.beats,
      srt,
      durationMs: synced.durationMs,
    });
  } catch (error) {
    console.error("Sync captions error:", error);
    const message = error instanceof Error ? error.message : "Caption sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
