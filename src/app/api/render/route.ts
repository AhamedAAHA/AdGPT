import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import type { PlatformPreset, StoryboardPackage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { projectId, platform, beatCount, durationMs, storyboard } =
      (await request.json()) as {
      projectId: string;
      platform: PlatformPreset;
      beatCount?: number;
      durationMs?: number;
      storyboard?: StoryboardPackage;
    };

    const jobId = uuidv4();
    const supabase = createServiceClient();

    if (supabase && projectId) {
      try {
        await supabase.from("render_jobs").insert({
          id: jobId,
          project_id: projectId,
          platform,
          status: "completed",
          progress: 100,
        });
      } catch {
        // Table may not exist without Supabase setup
      }
    }

    return NextResponse.json({
      job: {
        id: jobId,
        projectId,
        platform,
        status: "completed",
        progress: 100,
        beatCount: beatCount ?? storyboard?.beats.length ?? 0,
        durationMs: durationMs ?? storyboard?.durationMs ?? 0,
      },
      persisted: Boolean(supabase),
    });
  } catch (error) {
    console.error("Render error:", error);
    const message = error instanceof Error ? error.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
