import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import type { StoryboardPackage } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, imageUrl, script, storyboard, brandDna } = body as {
    name?: string;
    imageUrl: string;
    script: string;
    storyboard?: StoryboardPackage;
    brandDna?: Record<string, unknown>;
  };

  const fallback = {
    id: uuidv4(),
    name: name ?? "Untitled Project",
    image_url: imageUrl,
    script,
    storyboard,
    brand_dna: brandDna,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json({ project: fallback, persisted: false });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: name ?? "Untitled Project",
        image_url: imageUrl,
        script,
        storyboard,
        brand_dna: brandDna,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ project: data, persisted: true });
  } catch (error) {
    console.error("Project save error:", error);
    return NextResponse.json({ project: fallback, persisted: false });
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json({ projects: [], persisted: false });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ projects: data, persisted: true });
  } catch (error) {
    console.error("Projects fetch error:", error);
    return NextResponse.json({ projects: [], persisted: false });
  }
}
