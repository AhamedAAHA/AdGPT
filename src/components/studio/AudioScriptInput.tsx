"use client";

import { useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioScriptInputProps {
  onTranscribed: (text: string) => void;
  onTranscribingChange?: (loading: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function AudioScriptInput({
  onTranscribed,
  onTranscribingChange,
  disabled,
  className,
}: AudioScriptInputProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    onTranscribingChange?.(true);
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transcription failed");
      onTranscribed(data.text);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Transcription failed");
    } finally {
      onTranscribingChange?.(false);
    }

    e.target.value = "";
  };

  return (
    <label
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-cyan-500/30",
        "bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors cursor-pointer text-sm",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <input
        type="file"
        accept="audio/*,video/mp4"
        onChange={handleUpload}
        disabled={disabled}
        className="hidden"
      />
      <Mic size={16} className="text-cyan-400" />
      <span className="text-cyber-gray">
        Or upload audio / voice memo — Speechmatics transcribes to script
      </span>
    </label>
  );
}

export function TranscribingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-cyan-400">
      <Loader2 size={14} className="animate-spin" />
      Transcribing with Speechmatics...
    </div>
  );
}
