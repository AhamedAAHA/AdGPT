"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStudioStore, useGenerateVoiceOver } from "@/store/studio-store";
import { AnalysisPanel } from "@/components/studio/AnalysisPanel";
import { HookSelector } from "@/components/studio/HookSelector";
import { VersionSelector } from "@/components/studio/VersionSelector";
import { ExportModal } from "@/components/studio/ExportModal";
import { CapCutEditor } from "@/components/studio/capcut/CapCutEditor";
import { StudioShell, StudioStepContainer } from "@/components/studio/StudioShell";
import { AudioScriptInput } from "@/components/studio/AudioScriptInput";
import {
  fileToDataUrl,
  fetchWithTimeout,
  parseApiError,
  compressImageForApi,
} from "@/lib/utils";
import {
  buildExportPackage,
  createExportDownloadUrl,
  createSrtDownloadUrl,
} from "@/lib/export-video";
import { triggerDownload } from "@/lib/download";
import { voiceStyleToOpenAI } from "@/lib/voice-map";
import { REMIX_STYLES, type VersionStyle } from "@/types";
import { ensureBeatsUseVideo } from "@/lib/video-enrich";
import { slimStoryboardForApi } from "@/lib/storyboard-api";

export default function StudioPage() {
  const store = useStudioStore();
  const generateVoiceOver = useGenerateVoiceOver();
  const [hooksLoading, setHooksLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(
    null
  );
  const [exportSrtUrl, setExportSrtUrl] = useState<string | null>(null);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "strategy" | "studio">("upload");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const audio = store.storyboard?.audio;

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const preview = await fileToDataUrl(file);
      store.setImageFile(file);
      store.setImagePreview(preview);
    },
    [store]
  );

  const runTts = useCallback(
    async (text: string, style: string) => {
      if (!text.trim()) return;
      setTtsLoading(true);
      try {
        await generateVoiceOver(text, voiceStyleToOpenAI(style));
      } catch (error) {
        console.error("TTS error:", error);
      } finally {
        setTtsLoading(false);
      }
    },
    [generateVoiceOver]
  );

  const handleVoiceToggle = useCallback(
    async (enabled: boolean) => {
      store.updateAudioSettings({ voiceOver: { enabled } });
      if (enabled && store.storyboard) {
        const style = audio?.voiceOver.style ?? "energetic";
        await runTts(store.storyboard.script, style);
      } else {
        store.setVoiceOverUrl(null);
        store.bumpPreview();
      }
    },
    [store, audio, runTts]
  );

  const handleVoiceChange = useCallback(
    async (style: string) => {
      store.updateAudioSettings({
        voiceOver: { style: style as "energetic" | "professional" | "storytelling" | "luxury" },
      });
      if (audio?.voiceOver.enabled !== false && store.storyboard) {
        await runTts(store.storyboard.script, style);
      }
    },
    [store, audio, runTts]
  );

  useEffect(() => {
    if (step !== "studio" || !store.storyboard) return;
    if (store.storyboard.audio.voiceOver.enabled && !store.voiceOverUrl) {
      runTts(
        store.storyboard.script,
        store.storyboard.audio.voiceOver.style
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, store.storyboard?.id]);

  const handleAnalyze = useCallback(async () => {
    if (!store.imageFile || !store.script) return;

    store.setIsAnalyzing(true);
    store.setAnalysisStep(0);
    setAnalysisError(null);

    try {
      const { base64, mimeType } = await compressImageForApi(store.imageFile);

      for (let i = 0; i < 4; i++) {
        store.setAnalysisStep(i + 1);
        await new Promise((r) => setTimeout(r, 350));
      }

      store.setAnalysisStep(5);

      const res = await fetchWithTimeout(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType,
            script: store.script,
          }),
        },
        120000
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }

      const data = await res.json();
      store.setAnalysis(data.analysis);
      store.setBrandDna(data.brandDna);
      store.setAnalysisStep(6);

      setHooksLoading(true);
      const hooksRes = await fetchWithTimeout(
        "/api/hooks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: data.analysis,
            script: store.script,
          }),
        },
        60000
      );

      if (hooksRes.ok) {
        const hooksData = await hooksRes.json();
        store.setHooks(hooksData.hooks);
        if (hooksData.hooks.length > 0) {
          store.setSelectedHook(hooksData.hooks[0]);
        }
      }
      setHooksLoading(false);
      setStep("strategy");
    } catch (error) {
      console.error(error);
      const msg = parseApiError(
        error instanceof Error ? error.message : "Analysis failed"
      );
      setAnalysisError(msg);
    } finally {
      store.setIsAnalyzing(false);
    }
  }, [store]);

  const handleGenerateStoryboard = useCallback(
    async (options?: { variant?: VersionStyle; isRemix?: boolean }) => {
      const state = useStudioStore.getState();
      if (!state.analysis || !state.brandDna) {
        alert("Missing analysis data. Go back and analyze your ad first.");
        return;
      }

      const variant = options?.variant ?? state.selectedVersion;
      const preservedImageUrl =
        state.storyboard?.imageUrl ?? state.imagePreview ?? "";
      const preservedProjectId = state.storyboard?.projectId ?? "";

      const hook =
        state.selectedHook ??
        state.hooks[0] ?? {
          id: "default-hook",
          text: state.script.split("\n")[0] || state.analysis.product,
          emoji: "🔥",
          type: state.analysis.hookType,
        };

      state.setIsGenerating(true);
      if (options?.isRemix) {
        state.setEnrichStatus(`Remixing · ${variant} style...`);
      }

      try {
        const res = await fetch("/api/storyboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: state.analysis,
            brandDna: state.brandDna,
            script: state.script,
            hook,
            variant,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ??
              `Storyboard generation failed (${res.status})`
          );
        }

        const data = await res.json();
        const storyboard = {
          ...data.storyboard,
          imageUrl: preservedImageUrl,
          projectId: preservedProjectId || data.storyboard.projectId,
          variant,
        };

        state.setStoryboard(storyboard);
        if (!options?.isRemix) {
          setStep("studio");
        }

        state.setIsEnrichingVideo(true);
        state.setEnrichStatus("Fetching stock B-roll clips...");

        const slimPayload = slimStoryboardForApi(storyboard);
        const canSendImageForAi =
          !options?.isRemix &&
          preservedImageUrl.length > 0 &&
          preservedImageUrl.length < 500_000;

        try {
          const enrichRes = await fetch("/api/enrich-video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storyboard: slimPayload,
              generateAiVideo: canSendImageForAi,
              ...(canSendImageForAi ? { imageUrl: preservedImageUrl } : {}),
            }),
          });

          if (enrichRes.ok) {
            const enriched = await enrichRes.json();
            state.setEnrichedStoryboard({
              ...enriched.storyboard,
              imageUrl: preservedImageUrl,
              projectId: preservedProjectId || enriched.storyboard.projectId,
              variant,
            });
            const clipCount = enriched.stockClips?.length ?? 0;
            state.setEnrichStatus(
              options?.isRemix
                ? `Remixed · ${variant} · ${clipCount} clips`
                : enriched.aiVideoGenerated
                  ? `Ready · ${clipCount} B-roll clips + AI video`
                  : `Ready · ${clipCount} B-roll clips`
            );
          } else {
            state.setEnrichedStoryboard(
              ensureBeatsUseVideo({
                ...storyboard,
                stockClips: state.storyboard?.stockClips,
              })
            );
            state.setEnrichStatus(
              options?.isRemix
                ? `Remixed · ${variant} (stock video fallbacks)`
                : "Using stock video fallbacks (enrich skipped)"
            );
          }
        } catch {
          state.setEnrichedStoryboard(
            ensureBeatsUseVideo({
              ...storyboard,
              stockClips: state.storyboard?.stockClips,
            })
          );
          state.setEnrichStatus(
            options?.isRemix
              ? `Remixed · ${variant} (stock video fallbacks)`
              : "Using stock video fallbacks"
          );
        } finally {
          state.setIsEnrichingVideo(false);
        }

        if (!options?.isRemix) {
          await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: state.analysis.product,
              imageUrl: preservedImageUrl,
              script: state.script,
              storyboard,
              brandDna: state.brandDna,
            }),
          });
        }
      } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "Generation failed");
      } finally {
        state.setIsGenerating(false);
      }
    },
    []
  );

  const closeExportModal = useCallback(() => {
    store.setShowExportModal(false);
    setRenderComplete(false);
    setRenderProgress(0);
    setExportError(null);
    setExportStatus("");
    if (exportDownloadUrl) URL.revokeObjectURL(exportDownloadUrl);
    if (exportSrtUrl) URL.revokeObjectURL(exportSrtUrl);
    if (videoDownloadUrl) URL.revokeObjectURL(videoDownloadUrl);
    setExportDownloadUrl(null);
    setExportSrtUrl(null);
    setVideoDownloadUrl(null);
  }, [store, exportDownloadUrl, exportSrtUrl, videoDownloadUrl]);

  const handleExport = useCallback(async () => {
    const state = useStudioStore.getState();
    const storyboard = state.storyboard;
    if (!storyboard) return;

    setIsRendering(true);
    setRenderProgress(0);
    setRenderComplete(false);
    setExportError(null);
    setExportStatus("Preparing export...");
    if (exportDownloadUrl) URL.revokeObjectURL(exportDownloadUrl);
    if (exportSrtUrl) URL.revokeObjectURL(exportSrtUrl);
    if (videoDownloadUrl) URL.revokeObjectURL(videoDownloadUrl);
    setExportDownloadUrl(null);
    setExportSrtUrl(null);
    setVideoDownloadUrl(null);
    state.setShowExportModal(true);

    try {
      const platform = state.selectedPlatform;

      setExportStatus("Rendering MP4 in your browser...");
      try {
        const { renderAdMp4 } = await import("@/lib/render-web-video");
        const blob = await renderAdMp4(
          {
            beats: storyboard.beats,
            imageUrl: storyboard.imageUrl,
            brandDna: storyboard.brandDna,
            voiceOverUrl: state.voiceOverUrl ?? undefined,
            transcriptWords:
              state.transcriptWords.length > 0
                ? state.transcriptWords
                : storyboard.transcriptWords ?? [],
            script: storyboard.script,
            durationMs: storyboard.durationMs,
            voiceOverDurationMs: state.voiceOverDurationMs ?? undefined,
            platform,
            storyboard,
          },
          (percent) => setRenderProgress(Math.min(percent, 85))
        );
        const mp4Url = URL.createObjectURL(blob);
        setVideoDownloadUrl(mp4Url);
        triggerDownload(mp4Url, `adgpt-${platform}.mp4`);
      } catch (mp4Error) {
        console.error("MP4 export failed:", mp4Error);
        setExportError(
          mp4Error instanceof Error
            ? `${mp4Error.message} You can still download the storyboard package below.`
            : "MP4 export failed in this browser. You can still download the storyboard package below."
        );
      }

      setExportStatus("Building storyboard package...");
      setRenderProgress((prev) => Math.max(prev, 90));

      const pkg = buildExportPackage(
        {
          ...storyboard,
          transcriptWords: state.transcriptWords,
        },
        platform,
        state.voiceOverUrl,
        state.captionSrt
      );
      const jsonUrl = createExportDownloadUrl(pkg);
      const srtUrl = pkg.srt ? createSrtDownloadUrl(pkg.srt) : null;

      setExportDownloadUrl(jsonUrl);
      setExportSrtUrl(srtUrl);
      triggerDownload(jsonUrl, `adgpt-${platform}.json`);
      if (srtUrl) {
        triggerDownload(srtUrl, `adgpt-${platform}.srt`);
      }

      void fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: storyboard.projectId,
          platform,
          beatCount: storyboard.beats.length,
          durationMs: storyboard.durationMs,
        }),
      }).catch((err) => console.warn("Render API log failed:", err));

      setRenderProgress(100);
      setRenderComplete(true);
      setExportStatus("Export ready");
    } catch (error) {
      console.error(error);
      setExportError(
        error instanceof Error ? error.message : "Export failed. Please try again."
      );
    } finally {
      setIsRendering(false);
    }
  }, [exportDownloadUrl, exportSrtUrl, videoDownloadUrl]);

  const handleRemix = useCallback(async () => {
    const state = useStudioStore.getState();
    if (!state.storyboard) {
      alert("Generate a storyboard before remixing.");
      return;
    }
    if (!state.analysis || !state.brandDna) {
      alert("Missing analysis data. Go back and analyze your ad first.");
      return;
    }
    if (state.isGenerating || state.isEnrichingVideo) return;

    const currentIdx = REMIX_STYLES.indexOf(state.selectedVersion);
    const nextStyle =
      REMIX_STYLES[(currentIdx + 1) % REMIX_STYLES.length] ?? "viral";
    state.setSelectedVersion(nextStyle);
    await handleGenerateStoryboard({ variant: nextStyle, isRemix: true });
  }, [handleGenerateStoryboard]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const audioPanelProps = {
    brandDna: store.brandDna,
    voiceStyle: audio?.voiceOver.style ?? "energetic",
    musicMood: audio?.music.mood ?? "trending",
    onVoiceChange: handleVoiceChange,
    onMusicChange: (mood: string) =>
      store.updateAudioSettings({
        music: { mood: mood as "trending" | "cinematic" | "corporate" },
      }),
    voiceEnabled: audio?.voiceOver.enabled ?? true,
    musicEnabled: audio?.music.enabled ?? true,
    onVoiceToggle: handleVoiceToggle,
    onMusicToggle: (enabled: boolean) =>
      store.updateAudioSettings({ music: { enabled } }),
  };

  if (step === "studio" && store.storyboard) {
    return (
      <>
        <CapCutEditor
          onExport={handleExport}
          onRemix={handleRemix}
          onBack={() => setStep("strategy")}
          isEnriching={store.isEnrichingVideo}
          isBusy={store.isGenerating || store.isEnrichingVideo}
          statusText={store.enrichStatus ?? undefined}
          audioProps={audioPanelProps}
          onScriptChange={() => {}}
        />
        <ExportModal
          isOpen={store.showExportModal}
          onClose={closeExportModal}
          selectedPlatform={store.selectedPlatform}
          onPlatformChange={store.setSelectedPlatform}
          onExport={handleExport}
          isRendering={isRendering}
          renderProgress={renderProgress}
          isComplete={renderComplete}
          exportStatus={exportStatus}
          exportError={exportError}
          videoDownloadUrl={videoDownloadUrl}
          downloadUrl={exportDownloadUrl}
          srtDownloadUrl={exportSrtUrl}
        />
      </>
    );
  }

  return (
    <StudioShell
      step={step}
      onBack={step === "strategy" ? () => setStep("upload") : undefined}
      statusText={
        ttsLoading
          ? "Generating voice-over..."
          : store.isSyncingCaptions
            ? "Syncing captions..."
            : undefined
      }
    >
      {step === "upload" && (
        <StudioStepContainer>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">Upload Your Creative</h1>
              <p className="text-muted">
                Upload a static ad image and paste your script to begin
              </p>
            </div>

            <label className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/30 transition-colors min-h-[240px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {store.imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-xl object-contain"
                />
              ) : (
                <>
                  <Upload className="text-cyan-400 mb-3" size={40} />
                  <p className="text-sm font-medium">Drop your static ad here</p>
                  <p className="text-xs text-muted mt-1">PNG, JPG, WebP</p>
                </>
              )}
            </label>

            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <label className="text-sm font-medium">Script / Copy</label>
              <textarea
                value={store.script}
                onChange={(e) => store.setScript(e.target.value)}
                placeholder="Paste your ad copy, headline, offer, and CTA..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <AudioScriptInput
                disabled={isTranscribing || store.isAnalyzing}
                onTranscribingChange={setIsTranscribing}
                onTranscribed={(text) => store.setScript(text)}
              />
              {isTranscribing && (
                <p className="text-xs text-cyan-400 animate-pulse">
                  Transcribing audio with Speechmatics...
                </p>
              )}
            </div>

            <AnalysisPanel
              isAnalyzing={store.isAnalyzing}
              analysisStep={store.analysisStep}
              analysis={store.analysis}
              error={analysisError}
            />

            <Button
              size="lg"
              className="w-full"
              onClick={handleAnalyze}
              disabled={
                !store.imageFile || !store.script || store.isAnalyzing
              }
            >
              <Wand2 size={18} />
              {store.isAnalyzing ? "Analyzing..." : "Analyze Creative"}
            </Button>
          </motion.div>
        </StudioStepContainer>
      )}

      {step === "strategy" && store.analysis && (
        <>
          <StudioStepContainer>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <AnalysisPanel
                isAnalyzing={false}
                analysisStep={6}
                analysis={store.analysis}
              />
              <HookSelector
                hooks={store.hooks}
                selected={store.selectedHook}
                onSelect={store.setSelectedHook}
                isLoading={hooksLoading}
              />
              {!store.hooks.length && !hooksLoading && (
                <div className="glass-panel rounded-2xl p-4 text-sm text-cyber-gray">
                  No hooks returned — a default hook will be used. You can still
                  generate the storyboard.
                </div>
              )}
              <VersionSelector
                selected={store.selectedVersion}
                onSelect={store.setSelectedVersion}
              />
            </motion.div>
          </StudioStepContainer>

          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-cyan-500/15 cyber-panel rounded-none backdrop-blur-xl">
              <div className="max-w-2xl mx-auto flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep("upload")}
                  className="flex-1 cyber-btn-ghost"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleGenerateStoryboard()}
                  disabled={store.isGenerating}
                  className="flex-1 shadow-lg shadow-cyan-500/20"
                >
                  <Wand2 size={16} />
                  {store.isGenerating ? "Generating..." : "Generate Storyboard"}
                </Button>
              </div>
            </div>
          </>
        )}

      <ExportModal
        isOpen={store.showExportModal}
        onClose={closeExportModal}
        selectedPlatform={store.selectedPlatform}
        onPlatformChange={store.setSelectedPlatform}
        onExport={handleExport}
        isRendering={isRendering}
        renderProgress={renderProgress}
        isComplete={renderComplete}
        exportStatus={exportStatus}
        exportError={exportError}
        videoDownloadUrl={videoDownloadUrl}
        downloadUrl={exportDownloadUrl}
        srtDownloadUrl={exportSrtUrl}
      />
    </StudioShell>
  );
}
