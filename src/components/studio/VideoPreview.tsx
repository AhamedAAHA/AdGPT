"use client";

import { useEffect } from "react";
import { Player } from "@remotion/player";
import { AdComposition } from "@/remotion/AdComposition";
import { preloadBeatVideos } from "@/lib/preload-videos";
import { preloadVoiceOver } from "@/lib/audio-sync";
import type { Beat, BrandDna, TranscriptWord } from "@/types";
import { PLATFORM_PRESETS, type PlatformPreset } from "@/types";
import { getCompositionDurationMs } from "@/lib/pacing";

interface VideoPreviewProps {
  beats: Beat[];
  imageUrl: string;
  brandDna: BrandDna;
  captionSize?: number;
  durationMs?: number;
  voiceOverUrl?: string | null;
  platform?: PlatformPreset;
  previewKey?: number;
  transcriptWords?: TranscriptWord[];
  voiceOverDurationMs?: number | null;
  script?: string;
  className?: string;
  fill?: boolean;
}

export function VideoPreview({
  beats,
  imageUrl,
  brandDna,
  captionSize,
  durationMs = 20000,
  voiceOverUrl,
  platform = "instagram-reel",
  previewKey = 0,
  transcriptWords = [],
  voiceOverDurationMs = null,
  script,
  className,
  fill = false,
}: VideoPreviewProps) {
  const preset = PLATFORM_PRESETS[platform];
  const size = captionSize ?? preset.captionSize;

  useEffect(() => {
    if (beats.length) preloadBeatVideos(beats);
    if (voiceOverUrl) preloadVoiceOver(voiceOverUrl);
  }, [beats, voiceOverUrl, previewKey]);

  if (!beats.length) {
    return (
      <div
        className={`w-full aspect-[9/16] rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${className ?? ""}`}
      >
        <p className="text-muted text-sm">Video preview will appear here</p>
      </div>
    );
  }

  const timelineEndMs = getCompositionDurationMs({
    durationMs,
    beats,
    transcriptWords,
    voiceOverDurationMs,
  });
  const durationInFrames = Math.max(
    30,
    Math.round((timelineEndMs / 1000) * 30)
  );

  return (
    <div
      className={`relative overflow-hidden border border-cyan-500/20 shadow-lg shadow-cyan-500/10 rounded-xl ${
        fill ? "w-full h-full" : "w-full aspect-[9/16]"
      } ${className ?? ""}`}
    >
      <Player
        key={previewKey}
        component={AdComposition}
        inputProps={{
          beats,
          imageUrl,
          brandDna,
          captionSize: size,
          voiceOverUrl: voiceOverUrl ?? undefined,
          transcriptWords,
          script,
          voiceOverDurationMs: voiceOverDurationMs ?? undefined,
        }}
        durationInFrames={durationInFrames}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={30}
        style={{ width: "100%", height: "100%" }}
        controls
        autoPlay
        loop={!voiceOverUrl}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
