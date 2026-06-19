import type { Beat, BeatVisual, CreativeAnalysis, StoryboardPackage } from "@/types";
import {
  beatsAreAudioSynced,
  normalizeBeatsForPlayback,
} from "@/lib/playback-normalize";
import {
  fetchClipsForStoryboard,
  brollQueryForBeat,
  fetchFallbackStockClips,
  getDemoStockClips,
  isBlockedStockVideoUrl,
  searchPexelsVideos,
  type PexelsClip,
} from "@/lib/pexels";
import { applyPlaybackVideoUrls } from "@/lib/video-url";
import { generateImageToVideo } from "@/lib/replicate-video";

const ROLE_VISUAL_PLAN: Record<
  Beat["role"],
  BeatVisual["source"]
> = {
  hook: "broll",
  problem: "broll",
  benefit: "broll",
  proof: "ai-video",
  cta: "broll",
};

function pickClip(
  clips: PexelsClip[],
  beatIndex: number,
  usedIds: Set<number>
): PexelsClip | null {
  const pool = clips.filter(
    (clip) => clip.url && !isBlockedStockVideoUrl(clip.url)
  );
  if (!pool.length) return null;

  const unused = pool.filter((clip) => !usedIds.has(clip.id));
  const candidates = unused.length ? unused : pool;
  const clip = candidates[beatIndex % candidates.length];
  usedIds.add(clip.id);
  return clip;
}

function assignBroll(
  beat: Beat,
  beatIndex: number,
  analysis: CreativeAnalysis,
  clips: PexelsClip[],
  usedIds: Set<number>
): BeatVisual {
  const query = brollQueryForBeat(beat, analysis);
  const clip = pickClip(clips, beatIndex, usedIds);

  if (!clip) {
    const demo = getDemoStockClips()[0];
    if (demo) {
      return {
        source: "broll",
        videoUrl: demo.url,
        thumbnailUrl: demo.thumbnail,
        brollQuery: query,
        videoStartAt: 0,
      };
    }
    return { source: "broll", brollQuery: query };
  }

  const startOffset = (beatIndex * 2.5) % Math.max(clip.duration - 1, 1);

  return {
    source: "broll",
    videoUrl: clip.url,
    thumbnailUrl: clip.thumbnail,
    brollQuery: query,
    videoStartAt: startOffset,
  };
}

function sanitizeBeatVisual(beat: Beat): Beat {
  const url = beat.visual?.videoUrl;
  if (!url || !isBlockedStockVideoUrl(url)) return beat;

  return {
    ...beat,
    visual: {
      ...beat.visual,
      source: beat.visual?.source ?? "broll",
      videoUrl: undefined,
      thumbnailUrl: beat.visual?.thumbnailUrl,
    },
  };
}

export async function enrichStoryboardVisuals(
  storyboard: StoryboardPackage,
  options?: { generateAiVideo?: boolean }
): Promise<{
  storyboard: StoryboardPackage;
  stockClips: PexelsClip[];
  aiVideoGenerated: boolean;
}> {
  let clips = await fetchClipsForStoryboard(storyboard);
  if (!clips.length) {
    clips = await fetchFallbackStockClips();
  }

  const usedIds = new Set<number>();
  let aiVideoGenerated = false;
  let aiVideoUrl: string | null = null;

  if (options?.generateAiVideo !== false && storyboard.imageUrl) {
    const proofBeat = storyboard.beats.find((b) => b.role === "proof");
    if (proofBeat) {
      aiVideoUrl = await generateImageToVideo(storyboard.imageUrl);
      aiVideoGenerated = Boolean(aiVideoUrl);
    }
  }

  const enrichedBeats: Beat[] = storyboard.beats.map((beat, beatIndex) => {
    const planned = ROLE_VISUAL_PLAN[beat.role];
    let visual: BeatVisual;

    if (planned === "ai-video" && aiVideoUrl) {
      visual = {
        source: "ai-video",
        videoUrl: aiVideoUrl,
        thumbnailUrl: clips[0]?.thumbnail,
        videoStartAt: 0,
      };
    } else {
      visual = assignBroll(beat, beatIndex, storyboard.analysis, clips, usedIds);
    }

    return sanitizeBeatVisual({ ...beat, visual });
  });

  return {
    storyboard: {
      ...storyboard,
      beats: enrichedBeats,
      stockClips: clips
        .filter((c) => !isBlockedStockVideoUrl(c.url))
        .map((c) => ({
          id: c.id,
          url: c.url,
          thumbnail: c.thumbnail,
          duration: c.duration,
          query: c.query,
        })),
    },
    stockClips: clips,
    aiVideoGenerated,
  };
}

/** Replace hero/static or broken URLs before preview or export */
export function ensureBeatsUseVideo(
  storyboard: StoryboardPackage,
  options?: { forExport?: boolean; exportOrigin?: string }
): StoryboardPackage {
  const fromStoryboard =
    storyboard.stockClips
      ?.filter((clip) => !isBlockedStockVideoUrl(clip.url))
      .map((clip) => ({
        id: clip.id,
        url: clip.url,
        thumbnail: clip.thumbnail,
        duration: clip.duration,
        width: 1080,
        height: 1920,
        query: clip.query,
      })) ?? [];

  const clips = fromStoryboard.length ? fromStoryboard : getDemoStockClips();

  const usedIds = new Set<number>();
  const beats = storyboard.beats.map((beat, beatIndex) => {
    const cleaned = sanitizeBeatVisual(beat);
    const url = cleaned.visual?.videoUrl;
    const hasVideo =
      url &&
      cleaned.visual?.source !== "hero" &&
      cleaned.visual?.source !== "typography";

    if (hasVideo) return cleaned;

    return {
      ...cleaned,
      visual: assignBroll(
        cleaned,
        beatIndex,
        storyboard.analysis,
        clips,
        usedIds
      ),
    };
  });

  return {
    ...storyboard,
    beats: applyPlaybackVideoUrls(
      normalizeBeatsForPlayback(beats, {
        lockTimeline: beatsAreAudioSynced(beats),
      }),
      options
    ),
  };
}

export async function searchStockClips(query: string) {
  const clips = await searchPexelsVideos(query, 6);
  const playable = clips.filter((c) => !isBlockedStockVideoUrl(c.url));
  return playable.length ? playable : await fetchFallbackStockClips();
}
