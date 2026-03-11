"use client";

import { Cut } from "@/lib/types";

interface Props {
  cut: Cut;
  onToggle: (cutId: number, checked: boolean) => void;
}

const materialBadge: Record<string, { bg: string; text: string; label: string }> = {
  "実写": { bg: "bg-blue-100", text: "text-blue-700", label: "実写" },
  "MG": { bg: "bg-pink-100", text: "text-pink-700", label: "MG" },
  "既存写真": { bg: "bg-orange-100", text: "text-orange-700", label: "既存写真" },
  "MG+実写": { bg: "bg-purple-100", text: "text-purple-700", label: "MG+実写" },
  "MG+写真": { bg: "bg-purple-100", text: "text-purple-700", label: "MG+写真" },
  "個人写真": { bg: "bg-amber-100", text: "text-amber-700", label: "個人写真" },
};

export function CutRow({ cut, onToggle }: Props) {
  const badge = materialBadge[cut.material_type] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: cut.material_type,
  };

  return (
    <div
      className={`cut-row flex items-start gap-3 px-4 py-3 min-h-[48px] cursor-pointer active:bg-gray-100 transition-colors border-b border-gray-100 ${
        cut.checked ? "bg-green-50" : ""
      }`}
      onClick={() => onToggle(cut.id, !cut.checked)}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            cut.checked
              ? "bg-green-500 border-green-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {cut.checked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-gray-400">
            S{cut.scene_number}-C{cut.cut_number}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          <span className="text-xs text-gray-400">{cut.shot_type}</span>
        </div>
        <p
          className={`text-sm leading-tight ${
            cut.checked ? "text-gray-400 line-through" : "text-gray-800"
          }`}
        >
          {cut.subject}
        </p>
        {cut.notes && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{cut.notes}</p>
        )}
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 text-xs text-gray-400 pt-0.5">
        {cut.duration_seconds}s
      </div>
    </div>
  );
}
