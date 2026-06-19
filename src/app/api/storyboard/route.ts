import { NextRequest, NextResponse } from "next/server";
import { generateStoryboard } from "@/lib/ai";
import { isOpenAIConfigured } from "@/lib/openai";
import type {
  CreativeAnalysis,
  BrandDna,
  HookOption,
  VersionStyle,
} from "@/types";

export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      analysis,
      brandDna,
      script,
      hook,
      variant,
    } = body as {
      analysis: CreativeAnalysis;
      brandDna: BrandDna;
      script: string;
      hook: HookOption;
      variant: VersionStyle;
      imageUrl?: string;
    };

    if (!analysis || !brandDna || !script || !hook) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const storyboard = await generateStoryboard(
      analysis,
      brandDna,
      script,
      hook,
      variant ?? "luxury",
      ""
    );

    return NextResponse.json({ storyboard });
  } catch (error) {
    console.error("Storyboard error:", error);
    const message =
      error instanceof Error ? error.message : "Storyboard generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
