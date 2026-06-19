import { NextRequest, NextResponse } from "next/server";
import { isSpeechmaticsConfigured, transcribeAudioBuffer } from "@/lib/speechmatics";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    if (!isSpeechmaticsConfigured()) {
      return NextResponse.json(
        { error: "Speechmatics API key not configured. Add SPEECHMATICS_API_KEY to .env.local" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) ?? "en";

    if (!file) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { words, text, srt } = await transcribeAudioBuffer(
      buffer,
      file.name || "audio.mp3",
      language
    );

    return NextResponse.json({ text, words, srt });
  } catch (error) {
    console.error("Transcribe error:", error);
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
