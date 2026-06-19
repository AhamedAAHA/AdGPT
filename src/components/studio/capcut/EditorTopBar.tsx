"use client";

import {
  Download,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EditorTopBarProps {
  projectName: string;
  onBack?: () => void;
  onExport: () => void;
  onRemix: () => void;
  isEnriching?: boolean;
  isBusy?: boolean;
  statusText?: string;
}

export function EditorTopBar({
  projectName,
  onBack,
  onExport,
  onRemix,
  isEnriching,
  isBusy,
  statusText,
}: EditorTopBarProps) {
  const busy = isBusy ?? isEnriching;
  return (
    <header className="h-12 shrink-0 cyber-panel border-x-0 border-t-0 rounded-none px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <span className="text-sm font-bold shrink-0">
          <span className="text-white">Ad</span>
          <span className="text-cyan-400">GPT</span>
        </span>
        <span className="text-white/20 shrink-0">|</span>
        <span className="text-sm text-white/70 truncate">
          {projectName}
        </span>
        {(busy || statusText) && (
          <span className="text-[10px] font-mono text-cyan-400/80 truncate hidden lg:inline ml-2">
            {statusText ?? (busy ? "Remixing storyboard..." : "")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemix}
          disabled={busy}
          className="h-8 text-xs"
        >
          <RotateCcw size={14} className={busy ? "animate-spin" : ""} />
          <span className="hidden sm:inline">
            {busy ? "Remixing..." : "Remix"}
          </span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onExport}
          disabled={busy}
          className="h-8 text-xs"
        >
          <Download size={14} />
          Export
        </Button>
      </div>
    </header>
  );
}
