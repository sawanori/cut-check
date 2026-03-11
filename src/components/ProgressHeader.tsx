"use client";

import { Cut, ScheduleBlock } from "@/lib/types";

interface Props {
  blocks: ScheduleBlock[];
  postProduction: Cut[];
}

export function ProgressHeader({ blocks, postProduction }: Props) {
  const filmableCuts = blocks.flatMap((b) => b.cuts);
  const filmableChecked = filmableCuts.filter((c) => c.checked).length;
  const filmableTotal = filmableCuts.length;

  const postChecked = postProduction.filter((c) => c.checked).length;
  const postTotal = postProduction.length;

  const totalChecked = filmableChecked + postChecked;
  const totalAll = filmableTotal + postTotal;
  const percent = totalAll > 0 ? Math.round((totalChecked / totalAll) * 100) : 0;
  const filmablePercent =
    filmableTotal > 0
      ? Math.round((filmableChecked / filmableTotal) * 100)
      : 0;

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <h1 className="text-base font-bold text-gray-900">
          撮影カットチェック
        </h1>
        <span className="text-sm font-semibold text-gray-600">
          {filmableChecked}/{filmableTotal} 撮影済
        </span>
      </div>

      {/* Filmable progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
        <div
          className="h-3 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${filmablePercent}%`,
            backgroundColor:
              filmablePercent === 100
                ? "#10b981"
                : filmablePercent > 50
                  ? "#3b82f6"
                  : "#f59e0b",
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>撮影 {filmablePercent}%</span>
        <span>
          全体 {totalChecked}/{totalAll} ({percent}%)
        </span>
      </div>
    </div>
  );
}
