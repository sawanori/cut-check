"use client";

import { Cut } from "@/lib/types";

interface Props {
  cut: Cut;
  onToggle: (cutId: number, checked: boolean) => void;
  onEdit: (cut: Cut) => void;
}

function shotTypeLabel(raw: string): string {
  const map: Record<string, string> = {
    "ECU": "超アップ",
    "CU": "アップ",
    "MCU": "バストアップ",
    "MS": "ミドル",
    "WS": "引き/全景",
  };
  // Handle compound types like "MS→引き", "MCU→CU", "ECU→MS", "CU（Bロール）"
  let label = raw;
  for (const [key, val] of Object.entries(map)) {
    label = label.replace(new RegExp(`\\b${key}\\b`, "g"), val);
  }
  return label;
}

const materialBadge: Record<string, { bg: string; text: string; label: string }> = {
  "実写": { bg: "bg-blue-100", text: "text-blue-700", label: "実写" },
  "MG": { bg: "bg-pink-100", text: "text-pink-700", label: "MG" },
  "既存写真": { bg: "bg-orange-100", text: "text-orange-700", label: "既存写真" },
  "MG+実写": { bg: "bg-purple-100", text: "text-purple-700", label: "MG+実写" },
  "MG+写真": { bg: "bg-purple-100", text: "text-purple-700", label: "MG+写真" },
  "個人写真": { bg: "bg-amber-100", text: "text-amber-700", label: "個人写真" },
};

export function CutRow({ cut, onToggle, onEdit }: Props) {
  const badge = materialBadge[cut.material_type] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: cut.material_type,
  };

  return (
    <div
      className={`cut-row flex items-start gap-3 px-4 py-3 min-h-[48px] transition-colors border-b border-gray-100 ${
        cut.checked ? "bg-green-50" : ""
      }`}
    >
      {/* Checkbox */}
      <div
        className="flex-shrink-0 pt-0.5 cursor-pointer p-1 -m-1"
        onClick={() => onToggle(cut.id, !cut.checked)}
      >
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            cut.checked
              ? "bg-green-500 border-green-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {cut.checked && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Content - tap to toggle */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onToggle(cut.id, !cut.checked)}
      >
        {/* Header line: scene/cut, badge, shot type, timecode, duration */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {cut.scene_number > 0 && (
            <span className="text-xs font-mono font-bold text-gray-500">
              S{cut.scene_number}-C{cut.cut_number}
            </span>
          )}
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          {cut.shot_type && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
              {shotTypeLabel(cut.shot_type)}
            </span>
          )}
          {cut.timecode && (
            <span className="text-[10px] text-gray-400 font-mono">
              {cut.timecode}
            </span>
          )}
          {cut.duration_seconds > 0 && (
            <span className="text-[10px] text-gray-400">
              {cut.duration_seconds}秒
            </span>
          )}
          {cut.photo_substitute && cut.photo_substitute !== "×" && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-50 text-yellow-700">
              {cut.photo_substitute === "○" ? "写真代用可" : "写真△"}
            </span>
          )}
        </div>

        {/* Subject */}
        <p
          className={`text-sm font-medium leading-snug ${
            cut.checked ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {cut.subject}
        </p>

        {/* Direction */}
        {cut.direction && (
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            🎬 {cut.direction}
          </p>
        )}

        {/* Notes */}
        {cut.notes && (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            📝 {cut.notes}
          </p>
        )}
      </div>

      {/* Edit button */}
      <button
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(cut);
        }}
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}
