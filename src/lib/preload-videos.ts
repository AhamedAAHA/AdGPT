import { resolvePlaybackVideoUrl } from "@/lib/video-url";
import type { Beat } from "@/types";

const cache = new Set<string>();

export function collectBeatVideoUrls(beats: Beat[]): string[] {
  const urls = new Set<string>();
  for (const beat of beats) {
    const url = beat.visual?.videoUrl;
    if (!url) continue;
    const resolved = resolvePlaybackVideoUrl(url);
    if (resolved) urls.add(resolved);
  }
  return [...urls];
}

/** Warm browser video cache before Remotion Player starts */
export function preloadBeatVideos(beats: Beat[]): void {
  if (typeof document === "undefined") return;

  for (const url of collectBeatVideoUrls(beats)) {
    if (cache.has(url)) continue;
    cache.add(url);

    const el = document.createElement("video");
    el.preload = "auto";
    el.muted = true;
    el.playsInline = true;
    el.src = url;
    el.load();
  }
}
