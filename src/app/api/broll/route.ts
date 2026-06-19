import { NextRequest, NextResponse } from "next/server";
import { searchPexelsVideos, fetchFallbackStockClips } from "@/lib/pexels";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "business technology";
  try {
    const clips = await searchPexelsVideos(query, 8);
    const playable = clips.length ? clips : await fetchFallbackStockClips();
    return NextResponse.json({ clips: playable });
  } catch (error) {
    console.error("B-roll search error:", error);
    return NextResponse.json({ clips: [] });
  }
}
