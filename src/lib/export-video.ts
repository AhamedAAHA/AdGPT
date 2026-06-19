import type { Beat, BrandDna, TranscriptWord } from "@/types";
import { PLATFORM_PRESETS, type PlatformPreset } from "@/types";
import { generateSRT } from "@/lib/caption-sync";

export type ExportPackage = {
  version: "1.1";
  platform: PlatformPreset;
  platformPreset: (typeof PLATFORM_PRESETS)[PlatformPreset];
  exportedAt: string;
  beats: Beat[];
  imageUrl: string;
  brandDna: BrandDna;
  durationMs: number;
  script: string;
  voiceOverUrl?: string | null;
  transcriptWords?: TranscriptWord[];
  srt?: string;
};

export function buildExportPackage(
  storyboard: {
    beats: Beat[];
    imageUrl: string;
    brandDna: BrandDna;
    durationMs: number;
    script: string;
    transcriptWords?: TranscriptWord[];
  },
  platform: PlatformPreset,
  voiceOverUrl?: string | null,
  captionSrt?: string | null
): ExportPackage {
  const words = storyboard.transcriptWords ?? [];
  const srt = captionSrt ?? (words.length ? generateSRT(words) : undefined);

  return {
    version: "1.1",
    platform,
    platformPreset: PLATFORM_PRESETS[platform],
    exportedAt: new Date().toISOString(),
    beats: storyboard.beats,
    imageUrl: storyboard.imageUrl,
    brandDna: storyboard.brandDna,
    durationMs: storyboard.durationMs,
    script: storyboard.script,
    voiceOverUrl,
    transcriptWords: words.length ? words : undefined,
    srt,
  };
}

export function createExportDownloadUrl(pkg: ExportPackage): string {
  const blob = new Blob([JSON.stringify(pkg, null, 2)], {
    type: "application/json",
  });
  return URL.createObjectURL(blob);
}

export function createSrtDownloadUrl(srt: string): string {
  const blob = new Blob([srt], { type: "text/plain" });
  return URL.createObjectURL(blob);
}

export function getPlatformCaptionSize(platform: PlatformPreset): number {
  return PLATFORM_PRESETS[platform].captionSize;
}
