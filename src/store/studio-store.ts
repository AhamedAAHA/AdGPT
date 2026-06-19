"use client";

import { useCallback } from "react";
import { create } from "zustand";
import {
  buildCaptionSyncFromTts,
  captionSrtFromWords,
  getAudioDurationMs,
  preloadVoiceOver,
} from "@/lib/audio-sync";
import type {
  StoryboardPackage,
  Project,
  CreativeAnalysis,
  HookOption,
  VersionStyle,
  PlatformPreset,
  RenderJob,
  BrandDna,
  Beat,
  TranscriptWord,
} from "@/types";

interface StudioState {
  project: Project | null;
  storyboard: StoryboardPackage | null;
  analysis: CreativeAnalysis | null;
  brandDna: BrandDna | null;
  hooks: HookOption[];
  selectedHook: HookOption | null;
  selectedVersion: VersionStyle;
  selectedBeatIndex: number;
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisStep: number;
  imageFile: File | null;
  imagePreview: string | null;
  script: string;
  renderJob: RenderJob | null;
  showExportModal: boolean;
  selectedPlatform: PlatformPreset;
  voiceOverUrl: string | null;
  voiceOverDurationMs: number | null;
  previewKey: number;
  transcriptWords: TranscriptWord[];
  captionSrt: string | null;
  isSyncingCaptions: boolean;
  isEnrichingVideo: boolean;
  enrichStatus: string | null;

  setProject: (project: Project | null) => void;
  setStoryboard: (storyboard: StoryboardPackage | null) => void;
  setAnalysis: (analysis: CreativeAnalysis | null) => void;
  setBrandDna: (brandDna: BrandDna | null) => void;
  setHooks: (hooks: HookOption[]) => void;
  setSelectedHook: (hook: HookOption | null) => void;
  setSelectedVersion: (version: VersionStyle) => void;
  setSelectedBeatIndex: (index: number) => void;
  setIsAnalyzing: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setAnalysisStep: (step: number) => void;
  setImageFile: (file: File | null) => void;
  setImagePreview: (url: string | null) => void;
  setScript: (script: string) => void;
  setRenderJob: (job: RenderJob | null) => void;
  setShowExportModal: (v: boolean) => void;
  setSelectedPlatform: (platform: PlatformPreset) => void;
  setVoiceOverUrl: (url: string | null) => void;
  setVoiceOverDurationMs: (ms: number | null) => void;
  setTranscriptWords: (words: TranscriptWord[]) => void;
  setCaptionSrt: (srt: string | null) => void;
  setIsSyncingCaptions: (v: boolean) => void;
  setIsEnrichingVideo: (v: boolean) => void;
  setEnrichStatus: (status: string | null) => void;
  setEnrichedStoryboard: (storyboard: StoryboardPackage) => void;
  applyCaptionSync: (payload: {
    words: TranscriptWord[];
    beats?: Beat[];
    srt?: string;
    durationMs?: number;
  }) => void;
  updateBeat: (index: number, updates: Partial<Beat>) => void;
  updateStoryboardScript: (script: string) => void;
  updateAudioSettings: (
    audio: {
      voiceOver?: Partial<StoryboardPackage["audio"]["voiceOver"]>;
      music?: Partial<StoryboardPackage["audio"]["music"]>;
    }
  ) => void;
  bumpPreview: () => void;
  reset: () => void;
}

const initialState = {
  project: null,
  storyboard: null,
  analysis: null,
  brandDna: null,
  hooks: [],
  selectedHook: null,
  selectedVersion: "luxury" as VersionStyle,
  selectedBeatIndex: 0,
  isAnalyzing: false,
  isGenerating: false,
  analysisStep: 0,
  imageFile: null,
  imagePreview: null,
  script: "",
  renderJob: null,
  showExportModal: false,
  selectedPlatform: "instagram-reel" as PlatformPreset,
  voiceOverUrl: null,
  voiceOverDurationMs: null,
  previewKey: 0,
  transcriptWords: [],
  captionSrt: null,
  isSyncingCaptions: false,
  isEnrichingVideo: false,
  enrichStatus: null,
};

export const useStudioStore = create<StudioState>((set, get) => ({
  ...initialState,
  setProject: (project) => set({ project }),
  setStoryboard: (storyboard) =>
    set({ storyboard, previewKey: get().previewKey + 1 }),
  setAnalysis: (analysis) => set({ analysis }),
  setBrandDna: (brandDna) => set({ brandDna }),
  setHooks: (hooks) => set({ hooks }),
  setSelectedHook: (selectedHook) => set({ selectedHook }),
  setSelectedVersion: (selectedVersion) => set({ selectedVersion }),
  setSelectedBeatIndex: (selectedBeatIndex) => set({ selectedBeatIndex }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setAnalysisStep: (analysisStep) => set({ analysisStep }),
  setImageFile: (imageFile) => set({ imageFile }),
  setImagePreview: (imagePreview) => set({ imagePreview }),
  setScript: (script) => set({ script }),
  setRenderJob: (renderJob) => set({ renderJob }),
  setShowExportModal: (showExportModal) => set({ showExportModal }),
  setSelectedPlatform: (selectedPlatform) => set({ selectedPlatform }),
  setVoiceOverUrl: (voiceOverUrl) => set({ voiceOverUrl }),
  setVoiceOverDurationMs: (voiceOverDurationMs) => set({ voiceOverDurationMs }),
  setTranscriptWords: (transcriptWords) => set({ transcriptWords }),
  setCaptionSrt: (captionSrt) => set({ captionSrt }),
  setIsSyncingCaptions: (isSyncingCaptions) => set({ isSyncingCaptions }),
  setIsEnrichingVideo: (isEnrichingVideo) => set({ isEnrichingVideo }),
  setEnrichStatus: (enrichStatus) => set({ enrichStatus }),
  setEnrichedStoryboard: (storyboard) =>
    set({ storyboard, previewKey: get().previewKey + 1 }),
  applyCaptionSync: ({ words, beats, srt, durationMs }) => {
    const sb = get().storyboard;
    if (!sb) {
      set({
        transcriptWords: words,
        captionSrt: srt ?? null,
        previewKey: get().previewKey + 1,
      });
      return;
    }
    set({
      storyboard: {
        ...sb,
        beats: beats ?? sb.beats,
        transcriptWords: words,
        durationMs: durationMs ?? sb.durationMs,
      },
      transcriptWords: words,
      captionSrt: srt ?? null,
      previewKey: get().previewKey + 1,
    });
  },
  updateBeat: (index, updates) => {
    const sb = get().storyboard;
    if (!sb) return;
    const beats = [...sb.beats];
    beats[index] = { ...beats[index], ...updates };
    const durationMs = beats[beats.length - 1]?.endMs ?? sb.durationMs;
    set({
      storyboard: { ...sb, beats, durationMs },
      previewKey: get().previewKey + 1,
    });
  },
  updateStoryboardScript: (script) => {
    const sb = get().storyboard;
    if (!sb) return;
    set({ storyboard: { ...sb, script } });
  },
  updateAudioSettings: (audio) => {
    const sb = get().storyboard;
    if (!sb) return;
    set({
      storyboard: {
        ...sb,
        audio: {
          ...sb.audio,
          voiceOver: { ...sb.audio.voiceOver, ...audio?.voiceOver },
          music: { ...sb.audio.music, ...audio?.music },
        },
      },
      previewKey: get().previewKey + 1,
    });
  },
  bumpPreview: () => set({ previewKey: get().previewKey + 1 }),
  reset: () => set(initialState),
}));

export function useGenerateVoiceOver() {
  const setVoiceOverUrl = useStudioStore((s) => s.setVoiceOverUrl);
  const setVoiceOverDurationMs = useStudioStore((s) => s.setVoiceOverDurationMs);
  const bumpPreview = useStudioStore((s) => s.bumpPreview);
  const applyCaptionSync = useStudioStore((s) => s.applyCaptionSync);
  const setIsSyncingCaptions = useStudioStore((s) => s.setIsSyncingCaptions);

  return useCallback(
    async (text: string, voice: string = "nova") => {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const storyboard = useStudioStore.getState().storyboard;
      const audioDurationMs = await getAudioDurationMs(blob).catch(
        () => storyboard?.durationMs ?? 30_000
      );

      setIsSyncingCaptions(true);
      try {
        const synced = await buildCaptionSyncFromTts(
          blob,
          text,
          storyboard?.beats,
          audioDurationMs
        );

        const url = URL.createObjectURL(blob);
        preloadVoiceOver(url);
        setVoiceOverUrl(url);
        setVoiceOverDurationMs(audioDurationMs);
        applyCaptionSync({
          words: synced.words,
          beats: synced.beats,
          srt: captionSrtFromWords(synced.words),
          durationMs: synced.durationMs,
        });
        bumpPreview();
        return url;
      } finally {
        setIsSyncingCaptions(false);
      }
    },
    [
      setVoiceOverUrl,
      setVoiceOverDurationMs,
      bumpPreview,
      applyCaptionSync,
      setIsSyncingCaptions,
    ]
  );
}
