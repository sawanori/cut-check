"use client";

import { useState } from "react";
import { Cut } from "@/lib/types";
import { CutRow } from "./CutRow";

interface Props {
  cuts: Cut[];
  onToggle: (cutId: number, checked: boolean) => void;
  onEdit: (cut: Cut) => void;
}

export function PostProductionSection({ cuts, onToggle, onEdit }: Props) {
  const [open, setOpen] = useState(false);
  const checkedCount = cuts.filter((c) => c.checked).length;
  const total = cuts.length;

  const mgCuts = cuts.filter(
    (c) =>
      c.material_type === "MG" ||
      c.material_type === "MG+実写" ||
      c.material_type === "MG+写真"
  );
  const photoCuts = cuts.filter(
    (c) =>
      c.material_type === "既存写真" ||
      c.material_type === "個人写真"
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-surface-1">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-surface-2/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono font-bold text-violet tracking-wide">
              POST
            </span>
          </div>
          <h2 className="text-sm font-bold text-text-primary">
            ポストプロダクション素材
          </h2>
          <p className="text-[11px] text-text-muted font-mono mt-0.5">
            テロップ / MG / 既存写真 / スタッフ写真
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-surface-3 text-text-secondary">
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

      {open && (
        <div className="border-t border-border">
          {mgCuts.length > 0 && (
            <>
              <div className="px-4 py-2 bg-pink/5 border-b border-border flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-pink tracking-wider">MG / TELOP</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {mgCuts.filter((c) => c.checked).length}/{mgCuts.length}
                </span>
              </div>
              {mgCuts.map((cut) => (
                <CutRow key={cut.id} cut={cut} onToggle={onToggle} onEdit={onEdit} />
              ))}
            </>
          )}
          {photoCuts.length > 0 && (
            <>
              <div className="px-4 py-2 bg-orange/5 border-b border-border flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-orange tracking-wider">PHOTO</span>
                <span className="text-[10px] font-mono text-text-muted">
                  {photoCuts.filter((c) => c.checked).length}/{photoCuts.length}
                </span>
              </div>
              {photoCuts.map((cut) => (
                <CutRow key={cut.id} cut={cut} onToggle={onToggle} onEdit={onEdit} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
