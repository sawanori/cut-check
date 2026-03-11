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
      className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
        isCurrentBlock ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"
      }`}
      id={`block-${block.id}`}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCurrentBlock && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
            <span className="text-xs font-medium text-blue-600">
              {block.time_range}
            </span>
          </div>
          <h2 className="text-sm font-bold text-gray-900 mt-0.5">
            {block.title}
          </h2>
          {block.location && (
            <p className="text-xs text-gray-400">{block.location}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              allDone
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {checkedCount}/{total}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="border-t border-gray-100">
          {block.cuts.map((cut) => (
            <CutRow key={cut.id} cut={cut} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
