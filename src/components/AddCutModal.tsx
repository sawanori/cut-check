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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl px-5 pt-5 pb-8 max-w-lg mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">カット追加</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Block selector */}
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          撮影ブロック
        </label>
        <select
          value={blockId}
          onChange={(e) => setBlockId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm bg-white mb-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        >
          <option value="">ポスプロ（撮影ブロックなし）</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.time_range} {b.title}
            </option>
          ))}
        </select>

        {/* Subject input */}
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          内容
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="撮影するカットの内容を入力"
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          autoFocus
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!subject.trim() || submitting}
          className="w-full py-3 rounded-lg text-sm font-bold text-white bg-blue-500 active:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          {submitting ? "追加中..." : "追加する"}
        </button>
      </div>
    </>
  );
}
