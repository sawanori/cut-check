"use client";

import { useState } from "react";
import { Cut } from "@/lib/types";
import { CutRow } from "./CutRow";

interface Props {
  cuts: Cut[];
  onToggle: (cutId: number, checked: boolean) => void;
}

export function PostProductionSection({ cuts, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const checkedCount = cuts.filter((c) => c.checked).length;
  const total = cuts.length;

  // Group by material type
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h2 className="text-sm font-bold text-gray-600">
            ポストプロダクション素材
          </h2>
          <p className="text-xs text-gray-400">
            テロップ・MG・既存写真・スタッフ写真
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
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

      {open && (
        <div className="border-t border-gray-100">
          {mgCuts.length > 0 && (
            <>
              <div className="px-4 py-2 bg-pink-50 text-xs font-semibold text-pink-700 border-b border-pink-100">
                テロップ・MG ({mgCuts.filter((c) => c.checked).length}/{mgCuts.length})
              </div>
              {mgCuts.map((cut) => (
                <CutRow key={cut.id} cut={cut} onToggle={onToggle} />
              ))}
            </>
          )}
          {photoCuts.length > 0 && (
            <>
              <div className="px-4 py-2 bg-orange-50 text-xs font-semibold text-orange-700 border-b border-orange-100">
                既存写真・スタッフ写真 ({photoCuts.filter((c) => c.checked).length}/{photoCuts.length})
              </div>
              {photoCuts.map((cut) => (
                <CutRow key={cut.id} cut={cut} onToggle={onToggle} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
