import { NextRequest, NextResponse } from "next/server";
import { generateHooks } from "@/lib/ai";
import { isOpenAIConfigured } from "@/lib/openai";
import type { CreativeAnalysis } from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { analysis, script } = (await request.json()) as {
      analysis: CreativeAnalysis;
      script: string;
    };

    if (!analysis || !script) {
      return NextResponse.json(
        { error: "analysis and script are required" },
        { status: 400 }
      );
    }

    const hooks = await generateHooks(analysis, script);
    return NextResponse.json({ hooks });
  } catch (error) {
    console.error("Hooks error:", error);
    const message = error instanceof Error ? error.message : "Hook generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
