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
    <div className="sticky top-0 z-50 bg-surface-1/95 backdrop-blur-md border-b border-border px-4 pt-3 pb-3">
      {/* Top row: title + REC indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-rose tracking-widest uppercase">
              REC
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted">|</span>
          <h1 className="text-sm font-mono font-bold text-text-primary tracking-wide">
            CUT CHECK
          </h1>
        </div>
        <div className="font-mono text-right">
          <span className="text-lg font-bold text-amber tabular-nums">
            {filmableChecked}
          </span>
          <span className="text-sm text-text-muted">/{filmableTotal}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-1.5 bg-surface-3 rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            filmablePercent === 100 ? "progress-glow" : ""
          }`}
          style={{
            width: `${filmablePercent}%`,
            background:
              filmablePercent === 100
                ? "linear-gradient(90deg, #34d399, #4ecdc4)"
                : `linear-gradient(90deg, #f0a030, #4ecdc4)`,
          }}
        />
        {/* Tick marks */}
        <div className="absolute inset-0 flex">
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px bg-surface-0/40"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex justify-between font-mono text-[10px]">
        <span className="text-cyan">
          SHOOT {filmablePercent}%
        </span>
        <span className="text-text-muted">
          ALL {totalChecked}/{totalAll} ({percent}%)
        </span>
      </div>
    </div>
  );
}
