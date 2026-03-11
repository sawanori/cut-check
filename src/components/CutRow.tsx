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
  let label = raw;
  for (const [key, val] of Object.entries(map)) {
    label = label.replace(new RegExp(`\\b${key}\\b`, "g"), val);
  }
  return label;
}

const materialBadge: Record<string, { bg: string; text: string; label: string }> = {
  "実写": { bg: "bg-cyan/15", text: "text-cyan", label: "実写" },
  "MG": { bg: "bg-pink/15", text: "text-pink", label: "MG" },
  "既存写真": { bg: "bg-orange/15", text: "text-orange", label: "既存写真" },
  "MG+実写": { bg: "bg-violet/15", text: "text-violet", label: "MG+実写" },
  "MG+写真": { bg: "bg-violet/15", text: "text-violet", label: "MG+写真" },
  "個人写真": { bg: "bg-amber/15", text: "text-amber", label: "個人写真" },
};

export function CutRow({ cut, onToggle, onEdit }: Props) {
  const badge = materialBadge[cut.material_type] || {
    bg: "bg-surface-3",
    text: "text-text-secondary",
    label: cut.material_type,
  };

  return (
    <div
      className={`cut-row flex items-start gap-3 px-4 py-3 min-h-[48px] transition-all border-b border-border/50 ${
        cut.checked ? "bg-emerald-dim/10" : "bg-transparent"
      }`}
    >
      {/* Checkbox */}
      <div
        className="flex-shrink-0 pt-0.5 cursor-pointer p-1 -m-1"
        onClick={() => onToggle(cut.id, !cut.checked)}
      >
        <div
          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
            cut.checked
              ? "bg-emerald border border-emerald"
              : "border border-border-light bg-transparent"
          }`}
        >
          {cut.checked && (
            <svg className="w-3 h-3 text-surface-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onToggle(cut.id, !cut.checked)}
      >
        {/* Meta tags row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {cut.scene_number > 0 ? (
            <span className="text-[10px] font-mono font-bold text-amber">
              S{cut.scene_number}-C{cut.cut_number}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold px-1.5 py-px rounded bg-amber/20 text-amber border border-amber/30">
              ADDED
            </span>
          )}
          <span
            className={`inline-flex items-center px-1.5 py-px rounded text-[10px] font-mono font-medium ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
          {cut.shot_type && (
            <span className="text-[10px] font-mono px-1.5 py-px rounded bg-surface-3 text-text-secondary">
              {shotTypeLabel(cut.shot_type)}
            </span>
          )}
          {cut.timecode && (
            <span className="text-[10px] font-mono text-text-muted">
              {cut.timecode}
            </span>
          )}
          {cut.duration_seconds > 0 && (
            <span className="text-[10px] font-mono text-text-muted">
              {cut.duration_seconds}s
            </span>
          )}
          {cut.photo_substitute && cut.photo_substitute !== "×" && (
            <span className="text-[10px] font-mono px-1 py-px rounded bg-amber/10 text-amber-dim">
              {cut.photo_substitute === "○" ? "写真OK" : "写真△"}
            </span>
          )}
        </div>

        {/* Subject */}
        <p
          className={`text-[13px] font-medium leading-snug ${
            cut.checked ? "text-text-muted line-through" : "text-text-primary"
          }`}
        >
          {cut.subject}
        </p>

        {/* Direction */}
        {cut.direction && (
          <p className={`text-xs mt-1 leading-relaxed ${cut.checked ? "text-text-muted/50" : "text-cyan/80"}`}>
            <span className="font-mono text-[10px] text-cyan-dim mr-1">DIR</span>
            {cut.direction}
          </p>
        )}

        {/* Notes */}
        {cut.notes && (
          <p className={`text-xs mt-0.5 leading-relaxed ${cut.checked ? "text-text-muted/50" : "text-text-secondary"}`}>
            <span className="font-mono text-[10px] text-text-muted mr-1">NOTE</span>
            {cut.notes}
          </p>
        )}
      </div>

      {/* Edit button */}
      <button
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded active:bg-surface-3 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(cut);
        }}
      >
        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
      </button>
    </div>
  );
}
