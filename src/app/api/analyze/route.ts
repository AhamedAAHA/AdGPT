import { NextRequest, NextResponse } from "next/server";
import { analyzeCreative, extractBrandDna } from "@/lib/ai";
import { isOpenAIConfigured } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Set OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const { imageBase64, mimeType, script } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeCreative(imageBase64, mimeType);
    const brandDna = await extractBrandDna(imageBase64, mimeType, analysis);

    return NextResponse.json({ analysis, brandDna, script: script ?? "" });
  } catch (error) {
    console.error("Analyze error:", error);
    let message = error instanceof Error ? error.message : "Analysis failed";
    const cause = error instanceof Error && "cause" in error ? String(error.cause) : "";
    if (cause.includes("ENOTFOUND") || message.includes("Connection error")) {
      message =
        "Cannot reach OpenAI (api.openai.com). Check internet, VPN, or firewall.";
    }
    if (message.includes("401") || message.includes("Incorrect API key")) {
      message = "Invalid OpenAI API key. Update OPENAI_API_KEY in .env.local.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
