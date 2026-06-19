import type { Beat } from "@/types";

const PROXY_HOSTS = [
  "pexels.com",
  "replicate.delivery",
  "pbxt.replicate",
  "replicateusercontent.com",
];

function needsVideoProxy(hostname: string): boolean {
  return PROXY_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
}

function isExternalStockUrl(url: string): boolean {
  return (
    url.includes("pexels.com") ||
    url.includes("/api/video-proxy") ||
    url.includes("replicate")
  );
}

function extractProxiedTarget(url: string): string | null {
  if (!url.includes("/api/video-proxy")) return null;
  try {
    const parsed = new URL(url, "http://local");
    return parsed.searchParams.get("url");
  } catch {
    return null;
  }
}

/** Same-origin proxy — required for in-browser export (avoids Remotion test-pattern fallback) */
export function toExportProxyVideoUrl(
  url: string | undefined,
  origin: string
): string | undefined {
  if (!url || !origin) return url;

  const embedded = extractProxiedTarget(url);
  const target = embedded ?? url;

  if (target.startsWith("blob:") || target.startsWith("data:")) {
    return target;
  }

  if (target.startsWith("/api/video-proxy")) {
    return `${origin}${target}`;
  }

  try {
    const parsed = new URL(target);
    if (needsVideoProxy(parsed.hostname)) {
      return `${origin}/api/video-proxy?url=${encodeURIComponent(target)}`;
    }
  } catch {
    return url;
  }

  if (isExternalStockUrl(target)) {
    return `${origin}/api/video-proxy?url=${encodeURIComponent(target)}`;
  }

  return target;
}

/** Route external stock URLs through same-origin proxy for browser preview */
export function resolvePlaybackVideoUrl(
  url: string | undefined,
  options?: { forExport?: boolean; beatIndex?: number; exportOrigin?: string }
): string | undefined {
  if (!url) return undefined;

  if (options?.forExport) {
    const origin =
      options.exportOrigin ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return toExportProxyVideoUrl(url, origin);
  }

  if (url.startsWith("/api/video-proxy")) return url;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  try {
    const parsed = new URL(url);
    if (needsVideoProxy(parsed.hostname)) {
      return `/api/video-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }

  return url;
}

export function applyPlaybackVideoUrls(
  beats: Beat[],
  options?: { forExport?: boolean; exportOrigin?: string }
): Beat[] {
  return beats.map((beat, beatIndex) => {
    const videoUrl = beat.visual?.videoUrl;
    if (!videoUrl || !beat.visual) return beat;

    const resolved = resolvePlaybackVideoUrl(videoUrl, {
      ...options,
      beatIndex,
    });
    if (resolved === videoUrl) return beat;

    return {
      ...beat,
      visual: {
        ...beat.visual,
        videoUrl: resolved,
      },
    };
  });
}
