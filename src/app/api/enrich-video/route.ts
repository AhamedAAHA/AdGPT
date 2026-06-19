import { NextRequest, NextResponse } from "next/server";
import { enrichStoryboardVisuals } from "@/lib/video-enrich";
import type { StoryboardPackage } from "@/types";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyboard, generateAiVideo, imageUrl } = body as {
      storyboard: StoryboardPackage;
      generateAiVideo?: boolean;
      imageUrl?: string;
    };

    if (!storyboard?.beats?.length) {
      return NextResponse.json({ error: "storyboard required" }, { status: 400 });
    }

    const result = await enrichStoryboardVisuals(
      {
        ...storyboard,
        imageUrl: imageUrl ?? storyboard.imageUrl ?? "",
      },
      { generateAiVideo }
    );

    return NextResponse.json({
      storyboard: result.storyboard,
      stockClips: result.stockClips,
      aiVideoGenerated: result.aiVideoGenerated,
    });
  } catch (error) {
    console.error("Enrich video error:", error);
    const message = error instanceof Error ? error.message : "Enrichment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
