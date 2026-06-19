import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { AdComposition, type AdCompositionProps } from "@/remotion/AdComposition";
import { ensureBeatsUseVideo } from "@/lib/video-enrich";
import { normalizeBeatsForPlayback, beatsAreAudioSynced } from "@/lib/playback-normalize";
import { applyPlaybackVideoUrls } from "@/lib/video-url";
import { getCompositionDurationMs } from "@/lib/pacing";
import { PLATFORM_PRESETS, type PlatformPreset, type StoryboardPackage } from "@/types";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export async function checkCanRenderMp4(): Promise<{
  supported: boolean;
  message?: string;
}> {
  const result = await canRenderMediaOnWeb({
    container: "mp4",
    width: WIDTH,
    height: HEIGHT,
    muted: false,
  });

  if (result.canRender) {
    return { supported: true };
  }

  const message =
    result.issues.find((issue) => issue.severity === "error")?.message ??
    "In-browser MP4 export is not supported in this browser. Try Chrome or Edge.";

  return { supported: false, message };
}

export async function renderAdMp4(
  options: AdCompositionProps & {
    durationMs: number;
    platform?: PlatformPreset;
    storyboard?: StoryboardPackage;
    voiceOverDurationMs?: number | null;
    script?: string;
  },
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const support = await checkCanRenderMp4();
  if (!support.supported) {
    throw new Error(support.message ?? "MP4 export is not supported in this browser.");
  }

  const preset = PLATFORM_PRESETS[options.platform ?? "instagram-reel"];
  const beats = options.storyboard
    ? normalizeBeatsForPlayback(
        ensureBeatsUseVideo(options.storyboard, {
          forExport: true,
          exportOrigin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        }).beats,
        {
          lockTimeline:
            (options.transcriptWords?.length ?? 0) > 0 ||
            beatsAreAudioSynced(options.storyboard.beats),
        }
      )
    : normalizeBeatsForPlayback(
        applyPlaybackVideoUrls(options.beats, {
          forExport: true,
          exportOrigin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        }),
        {
          lockTimeline:
            (options.transcriptWords?.length ?? 0) > 0 ||
            beatsAreAudioSynced(options.beats),
        }
      );

  const durationMs = getCompositionDurationMs({
    durationMs: options.durationMs,
    beats,
    transcriptWords: options.transcriptWords,
    voiceOverDurationMs: options.voiceOverDurationMs,
  });

  const durationInFrames = Math.max(
    FPS,
    Math.round((durationMs / 1000) * FPS)
  );

  const inputProps: AdCompositionProps = {
    beats,
    imageUrl: options.imageUrl,
    brandDna: options.brandDna,
    captionSize: options.captionSize ?? preset.captionSize,
    voiceOverUrl: options.voiceOverUrl,
    transcriptWords: options.transcriptWords ?? [],
    script: options.script ?? options.storyboard?.script,
    voiceOverDurationMs: options.voiceOverDurationMs ?? undefined,
  };

  const { getBlob } = await renderMediaOnWeb({
    composition: {
      id: "AdComposition",
      component: AdComposition,
      durationInFrames,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
      defaultProps: inputProps,
    },
    inputProps,
    container: "mp4",
    onProgress: ({ progress }) => {
      onProgress?.(Math.round(progress * 100));
    },
  });

  return getBlob();
}
