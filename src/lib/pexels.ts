import type { Beat, CreativeAnalysis, StoryboardPackage } from "@/types";

const PEXELS_API = "https://api.pexels.com/videos/search";

export function isPexelsConfigured(): boolean {
  const key = process.env.PEXELS_API_KEY?.trim();
  return Boolean(key && !key.includes("your-"));
}

export type PexelsClip = {
  id: number;
  url: string;
  thumbnail: string;
  duration: number;
  width: number;
  height: number;
  query: string;
};

type PexelsVideoFile = {
  quality: string;
  link: string;
  width: number;
  height: number;
  file_type?: string;
};

function pickBrowserSafeVideoFile(files: PexelsVideoFile[]): PexelsVideoFile | undefined {
  const mp4 = files.filter(
    (f) => f.link?.includes(".mp4") || f.file_type === "video/mp4"
  );
  const pool = mp4.length ? mp4 : files;

  const sd = pool.find((f) => f.quality === "sd");
  if (sd) return sd;

  return (
    pool
      .filter((f) => f.height <= 720)
      .sort((a, b) => b.height - a.height)[0] ??
    pool.sort((a, b) => a.height - b.height)[0]
  );
}

type PexelsVideo = {
  id: number;
  image: string;
  duration: number;
  video_files: PexelsVideoFile[];
};

export async function searchPexelsVideos(
  query: string,
  perPage: number = 3
): Promise<PexelsClip[]> {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!isPexelsConfigured() || !apiKey) return [];

  const res = await fetch(
    `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
    { headers: { Authorization: apiKey } }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as { videos?: PexelsVideo[] };
  const clips: PexelsClip[] = [];

  for (const video of data.videos ?? []) {
    const file = pickBrowserSafeVideoFile(video.video_files);

    if (!file?.link) continue;

    clips.push({
      id: video.id,
      url: file.link,
      thumbnail: video.image,
      duration: video.duration,
      width: file.width,
      height: file.height,
      query,
    });
  }

  return clips;
}

const ROLE_BROLL_QUERIES: Record<string, string[]> = {
  hook: ["technology futuristic", "business success", "city night"],
  problem: ["stressed office", "chaos paperwork", "overwhelmed work"],
  benefit: ["team collaboration", "dashboard analytics", "happy workplace"],
  proof: ["data analytics screen", "growth chart", "achievement"],
  cta: ["call to action business", "handshake deal", "startup launch"],
};

export function brollQueryForBeat(
  beat: Beat,
  analysis: CreativeAnalysis
): string {
  const roleQueries = ROLE_BROLL_QUERIES[beat.role] ?? ["business technology"];
  const product = analysis.product.toLowerCase();
  if (product.length > 2) {
    return `${product} ${roleQueries[0]}`;
  }
  return roleQueries[Math.floor(Math.random() * roleQueries.length)];
}

export async function fetchClipsForStoryboard(
  storyboard: StoryboardPackage
): Promise<PexelsClip[]> {
  const allClips: PexelsClip[] = [];
  const seen = new Set<number>();

  const addClips = (clips: PexelsClip[]) => {
    for (const clip of clips) {
      if (!seen.has(clip.id)) {
        seen.add(clip.id);
        allClips.push(clip);
      }
    }
  };

  for (const beat of storyboard.beats) {
    if (beat.role === "cta") continue;
    addClips(
      await searchPexelsVideos(brollQueryForBeat(beat, storyboard.analysis), 3)
    );
  }

  if (allClips.length < storyboard.beats.length) {
    const genericQueries = [
      "business technology",
      "office professional",
      "education learning",
      "startup team",
      "digital innovation",
    ];
    for (const query of genericQueries) {
      addClips(await searchPexelsVideos(query, 4));
      if (allClips.length >= storyboard.beats.length * 2) break;
    }
  }

  return allClips;
}

const LEGACY_BLOCKED_URL_PATTERNS = [
  "/3129957/",
  "/3195394/",
  "/3255275/",
  "/7578612/",
];

/** Hardcoded Pexels CDN links expire / 403 in the browser — never use for playback */
export function isBlockedStockVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  return LEGACY_BLOCKED_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

/** No placeholder clips — empty pool uses gradient fallback in the composition */
export function getDemoStockClips(): PexelsClip[] {
  return [];
}

/** @deprecated Use fetchFallbackStockClips — returns empty to avoid 403 CDN links */
export function getFallbackStockClips(): PexelsClip[] {
  return [];
}

export async function fetchFallbackStockClips(): Promise<PexelsClip[]> {
  const queries = ["business technology", "office", "education", "startup"];
  const clips: PexelsClip[] = [];
  const seen = new Set<number>();

  for (const query of queries) {
    for (const clip of await searchPexelsVideos(query, 3)) {
      if (!seen.has(clip.id) && !isBlockedStockVideoUrl(clip.url)) {
        seen.add(clip.id);
        clips.push(clip);
      }
    }
    if (clips.length >= 6) break;
  }

  return clips.length ? clips : [];
}
