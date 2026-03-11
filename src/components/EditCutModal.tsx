"use client";

import { useState } from "react";
import { Cut, ScheduleBlock } from "@/lib/types";

interface Props {
  cut: Cut;
  blocks: ScheduleBlock[];
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditCutModal({ cut, blocks, open, onClose, onUpdated }: Props) {
  const [subject, setSubject] = useState(cut.subject);
  const [notes, setNotes] = useState(cut.notes);
  const [blockId, setBlockId] = useState<string>(
    cut.schedule_block_id !== null ? String(cut.schedule_block_id) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cuts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cut.id,
          subject: subject.trim(),
          notes: notes.trim(),
          schedule_block_id: blockId ? Number(blockId) : null,
        }),
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このカットを削除しますか？")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cuts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cut.id }),
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-1 border-t border-border rounded-t-2xl px-5 pt-5 pb-8 max-w-lg mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-cyan tracking-widest">EDIT</span>
            <h2 className="text-sm font-bold text-text-primary">カット編集</h2>
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
          className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-surface-2 text-text-primary mb-4 appearance-none focus:outline-none focus:border-cyan/50 transition-colors"
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
          className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-surface-2 text-text-primary mb-4 focus:outline-none focus:border-cyan/50 transition-colors"
        />

        <label className="block text-[10px] font-mono font-bold text-text-muted tracking-wider mb-1.5">
          NOTE
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="撮影メモ"
          className="w-full border border-border rounded-lg px-3 py-3 text-sm bg-surface-2 text-text-primary placeholder-text-muted mb-5 focus:outline-none focus:border-cyan/50 transition-colors"
        />

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={submitting}
            className="px-4 py-3 rounded-lg text-sm font-mono font-bold text-rose bg-rose-dim/30 active:bg-rose-dim/50 disabled:opacity-50 transition-colors"
          >
            DEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || submitting}
            className="flex-1 py-3 rounded-lg text-sm font-mono font-bold text-surface-0 bg-cyan active:bg-cyan-dim disabled:bg-surface-3 disabled:text-text-muted transition-colors"
          >
            {submitting ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </div>
    </>
  );
}
