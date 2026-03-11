"use client";

import { useState } from "react";
import { ScheduleBlock as ScheduleBlockType, Cut } from "@/lib/types";
import { CutRow } from "./CutRow";

interface Props {
  block: ScheduleBlockType;
  isCurrentBlock: boolean;
  onToggle: (cutId: number, checked: boolean) => void;
  onEdit: (cut: Cut) => void;
}

export function ScheduleBlock({ block, isCurrentBlock, onToggle, onEdit }: Props) {
  const [open, setOpen] = useState(isCurrentBlock);
  const checkedCount = block.cuts.filter((c) => c.checked).length;
  const total = block.cuts.length;
  const allDone = total > 0 && checkedCount === total;

  return (
    <div
      className={`rounded-lg overflow-hidden border transition-colors ${
        isCurrentBlock
          ? "border-amber/40 bg-surface-1"
          : "border-border bg-surface-1"
      }`}
      id={`block-${block.id}`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-surface-2/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isCurrentBlock && (
              <span className="w-2 h-2 rounded-full bg-amber pulse-amber" />
            )}
            <span className="text-xs font-mono font-bold text-amber tracking-wide">
              {block.time_range}
            </span>
          </div>
          <h2 className="text-sm font-bold text-text-primary">
            {block.title}
          </h2>
          {block.location && (
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              {block.location}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
              allDone
                ? "bg-emerald-dim/30 text-emerald"
                : "bg-surface-3 text-text-secondary"
            }`}
          >
            {checkedCount}/{total}
          </div>
          <svg
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Cut rows */}
      {open && (
        <div className="border-t border-border">
          {block.cuts.map((cut) => (
            <CutRow key={cut.id} cut={cut} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
