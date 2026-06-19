"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles, FileJson, Subtitles, Film, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PLATFORM_PRESETS } from "@/types";
import type { PlatformPreset } from "@/types";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlatform: PlatformPreset;
  onPlatformChange: (platform: PlatformPreset) => void;
  onExport: () => void;
  isRendering: boolean;
  renderProgress: number;
  isComplete: boolean;
  exportStatus?: string;
  exportError?: string | null;
  videoDownloadUrl?: string | null;
  downloadUrl?: string | null;
  srtDownloadUrl?: string | null;
}

export function ExportModal({
  isOpen,
  onClose,
  selectedPlatform,
  onPlatformChange,
  onExport,
  isRendering,
  renderProgress,
  isComplete,
  exportStatus,
  exportError,
  videoDownloadUrl,
  downloadUrl,
  srtDownloadUrl,
}: ExportModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-panel rounded-3xl p-8 max-w-lg w-full mx-4 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold neon-gradient-text">Export Video</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted">Select platform preset</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(PLATFORM_PRESETS) as [PlatformPreset, typeof PLATFORM_PRESETS[PlatformPreset]][]).map(
                  ([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onPlatformChange(key)}
                      disabled={isRendering}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedPlatform === key
                          ? "border-cyan-500/50 bg-cyan-500/10"
                          : "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <p className="text-sm font-medium">{preset.name}</p>
                      <p className="text-xs text-muted">{preset.aspectRatio}</p>
                    </button>
                  )
                )}
              </div>
            </div>

            {exportError && (
              <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{exportError}</span>
              </div>
            )}

            {isRendering && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-muted">
                    {exportStatus ?? "Rendering export..."}
                  </span>
                  <span className="text-cyan-400 font-mono shrink-0">
                    {renderProgress}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${renderProgress}%` }}
                    className="h-full neon-gradient rounded-full"
                  />
                </div>
                <p className="text-[11px] text-white/40">
                  MP4 renders in your browser — keep this tab open until finished.
                </p>
              </div>
            )}

            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 py-2">
                  <Sparkles className="text-cyan-400" size={24} />
                  <span className="text-lg font-semibold text-cyan-400">
                    Export ready!
                  </span>
                </div>
                {videoDownloadUrl && (
                  <a
                    href={videoDownloadUrl}
                    download={`adgpt-${selectedPlatform}.mp4`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Film size={16} />
                    Download MP4 video
                  </a>
                )}
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download={`adgpt-${selectedPlatform}.json`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-sm font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                  >
                    <FileJson size={16} />
                    Download storyboard package
                  </a>
                )}
                {srtDownloadUrl && (
                  <a
                    href={srtDownloadUrl}
                    download={`adgpt-${selectedPlatform}.srt`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-sm font-medium text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    <Subtitles size={16} />
                    Download synced captions (SRT)
                  </a>
                )}
              </motion.div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                {isComplete ? "Close" : "Cancel"}
              </Button>
              {!isComplete && (
                <Button
                  type="button"
                  onClick={onExport}
                  disabled={isRendering}
                  className="flex-1"
                >
                  <Download size={16} />
                  {isRendering ? "Exporting..." : "Start Export"}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
