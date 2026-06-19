"use client";

import { useState, useCallback, useMemo } from "react";
import { EditorTopBar } from "./EditorTopBar";
import { MediaBin, type MediaTab } from "./MediaBin";
import { InspectorPanel, type InspectorTab } from "./InspectorPanel";
import { CapCutTimeline } from "./CapCutTimeline";
import { VideoPreview } from "@/components/studio/VideoPreview";
import { useStudioStore } from "@/store/studio-store";
import { PLATFORM_PRESETS } from "@/types";
import type { StockClip, VisualSource } from "@/types";
import { ensureBeatsUseVideo } from "@/lib/video-enrich";
import { getCompositionDurationMs } from "@/lib/pacing";
import type { ComponentProps } from "react";

interface CapCutEditorProps {
  onExport: () => void;
  onRemix: () => void;
  onBack?: () => void;
  isEnriching?: boolean;
  isBusy?: boolean;
  statusText?: string;
  audioProps: ComponentProps<typeof import("@/components/studio/AudioPanel").AudioPanel>;
  onScriptChange: (script: string) => void;
}

export function CapCutEditor({
  onExport,
  onRemix,
  onBack,
  isEnriching,
  isBusy,
  statusText,
  audioProps,
  onScriptChange,
}: CapCutEditorProps) {
  const store = useStudioStore();
  const sb = store.storyboard!;
  const [mediaTab, setMediaTab] = useState<MediaTab>("media");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("beat");

  const captionSize = PLATFORM_PRESETS[store.selectedPlatform].captionSize;
  const activeBeat = sb.beats[store.selectedBeatIndex] ?? null;
  const playbackBeats = useMemo(
    () => ensureBeatsUseVideo(sb).beats,
    [sb, store.previewKey]
  );
  const timelineDurationMs = useMemo(
    () =>
      getCompositionDurationMs({
        durationMs: sb.durationMs,
        beats: sb.beats,
        transcriptWords: store.transcriptWords,
        voiceOverDurationMs: store.voiceOverDurationMs,
      }),
    [
      sb.durationMs,
      sb.beats,
      store.transcriptWords,
      store.voiceOverDurationMs,
    ]
  );

  const handleVisualSourceChange = useCallback(
    (index: number, source: VisualSource) => {
      const storyboard = useStudioStore.getState().storyboard;
      if (!storyboard) return;
      const beat = storyboard.beats[index];
      if (!beat) return;

      const clips = storyboard.stockClips ?? [];
      const clip = clips[index % Math.max(clips.length, 1)];

      if (source === "hero") {
        store.updateBeat(index, {
          visual: {
            source: "broll",
            videoUrl: clip?.url,
            thumbnailUrl: clip?.thumbnail,
            brollQuery: clip?.query ?? "stock footage",
            videoStartAt: index * 2,
          },
        });
        return;
      }

      store.updateBeat(index, {
        visual: {
          ...beat.visual,
          source,
          imageUrl: undefined,
          videoUrl:
            source === "broll"
              ? clip?.url ?? beat.visual?.videoUrl
              : source === "ai-video"
                ? beat.visual?.videoUrl
                : undefined,
          thumbnailUrl: clip?.thumbnail ?? beat.visual?.thumbnailUrl,
        },
      });
    },
    [store]
  );

  const handleClipSelect = useCallback(
    (clip: StockClip) => {
      const idx = useStudioStore.getState().selectedBeatIndex;
      store.updateBeat(idx, {
        visual: {
          source: "broll",
          videoUrl: clip.url,
          thumbnailUrl: clip.thumbnail,
          brollQuery: clip.query,
        },
      });
    },
    [store]
  );

  const handleScriptChange = useCallback(
    (script: string) => {
      store.updateStoryboardScript(script);
      onScriptChange(script);
    },
    [store, onScriptChange]
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col h-dvh text-white pointer-events-auto">
      <EditorTopBar
        projectName={sb.analysis.product || "Untitled"}
        onBack={onBack}
        onExport={onExport}
        onRemix={onRemix}
        isEnriching={isEnriching}
        isBusy={isBusy}
        statusText={statusText}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <MediaBin
          activeTab={mediaTab}
          onTabChange={setMediaTab}
          heroImageUrl={sb.imageUrl}
          stockClips={sb.stockClips}
          onClipSelect={handleClipSelect}
          activeBeat={activeBeat}
          beatIndex={store.selectedBeatIndex}
          onVisualSourceChange={handleVisualSourceChange}
          voiceStyle={audioProps.voiceStyle}
          musicMood={audioProps.musicMood}
          voiceEnabled={audioProps.voiceEnabled}
          musicEnabled={audioProps.musicEnabled}
          onVoiceChange={audioProps.onVoiceChange}
          onMusicChange={audioProps.onMusicChange}
          onVoiceToggle={audioProps.onVoiceToggle}
          onMusicToggle={audioProps.onMusicToggle}
          script={sb.script}
          onScriptChange={handleScriptChange}
          onFocusInspector={setInspectorTab}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 flex items-center justify-center p-3 min-h-0">
            <div className="h-full max-h-full aspect-[9/16] max-w-full rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/10 border border-cyan-500/20 glass-panel">
              <VideoPreview
                beats={playbackBeats}
                imageUrl={sb.imageUrl}
                brandDna={sb.brandDna}
                captionSize={captionSize}
                durationMs={sb.durationMs}
                voiceOverUrl={store.voiceOverUrl}
                platform={store.selectedPlatform}
                previewKey={store.previewKey}
                transcriptWords={store.transcriptWords}
                voiceOverDurationMs={store.voiceOverDurationMs}
                script={sb.script}
                fill
              />
            </div>
          </div>
        </div>

        <InspectorPanel
          beat={activeBeat}
          beatIndex={store.selectedBeatIndex}
          totalDurationMs={timelineDurationMs}
          onUpdateBeat={store.updateBeat}
          onVisualSourceChange={handleVisualSourceChange}
          brandDna={store.brandDna}
          scores={sb.scores}
          abVariants={sb.abVariants}
          audioProps={audioProps}
          script={sb.script}
          onScriptChange={handleScriptChange}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
        />
      </div>

      <CapCutTimeline
        beats={sb.beats}
        activeIndex={store.selectedBeatIndex}
        onBeatSelect={store.setSelectedBeatIndex}
        totalDurationMs={timelineDurationMs}
      />
    </div>
  );
}
