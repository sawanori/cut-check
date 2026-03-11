"use client";

import { useState } from "react";
import { ScheduleBlock } from "@/lib/types";

interface Props {
  blocks: ScheduleBlock[];
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddCutModal({ blocks, open, onClose, onAdded }: Props) {
  const [subject, setSubject] = useState("");
  const [blockId, setBlockId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cuts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          schedule_block_id: blockId ? Number(blockId) : null,
        }),
      });
      if (res.ok) {
        setSubject("");
        setBlockId("");
        onAdded();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-1 border-t border-border rounded-t-2xl px-5 pt-5 pb-8 max-w-lg mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-amber tracking-widest">NEW</span>
            <h2 className="text-sm font-bold text-text-primary">カット追加</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-3 active:bg-border transition-colors"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="block text-[10px] font-mono font-bold text-text-muted tracking-wider mb-1.5">
          BLOCK
        </label>
        <select
          value={blockId}
          onChange={(e) => setBlockId(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-surface-2 text-text-primary mb-4 appearance-none focus:outline-none focus:border-amber/50 transition-colors"
        >
          <option value="">ポスプロ（撮影ブロックなし）</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.time_range} {b.title}
            </option>
          ))}
        </select>

        <label className="block text-[10px] font-mono font-bold text-text-muted tracking-wider mb-1.5">
          SUBJECT
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="撮影するカットの内容"
          className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-surface-2 text-text-primary placeholder-text-muted mb-5 focus:outline-none focus:border-amber/50 transition-colors"
          autoFocus
        />

        <button
          onClick={handleSubmit}
          disabled={!subject.trim() || submitting}
          className="w-full py-3 rounded-lg text-sm font-mono font-bold text-surface-0 bg-amber active:bg-amber-dim disabled:bg-surface-3 disabled:text-text-muted transition-colors"
        >
          {submitting ? "ADDING..." : "ADD CUT"}
        </button>
      </div>
    </>
  );
}
