"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScheduleBlock as ScheduleBlockType, Cut, CheckState } from "@/lib/types";
import { ProgressHeader } from "./ProgressHeader";
import { ScheduleBlock } from "./ScheduleBlock";
import { PostProductionSection } from "./PostProductionSection";

interface Props {
  initialBlocks: ScheduleBlockType[];
  initialPostProduction: Cut[];
}

function getCurrentBlockId(blocks: ScheduleBlockType[]): number | null {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  for (const block of blocks) {
    const match = block.time_range.match(/(\d+):(\d+)~(\d+):(\d+)/);
    if (!match) continue;
    const start = parseInt(match[1]) * 60 + parseInt(match[2]);
    const end = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (currentMinutes >= start && currentMinutes < end) {
      return block.id;
    }
  }
  return null;
}

export function ScheduleTimeline({ initialBlocks, initialPostProduction }: Props) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [postProduction, setPostProduction] = useState(initialPostProduction);
  const [currentBlockId, setCurrentBlockId] = useState<number | null>(null);
  const etagRef = useRef<string>("");
  const scrolledRef = useRef(false);

  // Update current block every minute
  useEffect(() => {
    const update = () => setCurrentBlockId(getCurrentBlockId(blocks));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [blocks]);

  // Auto-scroll to current block on first render
  useEffect(() => {
    if (currentBlockId && !scrolledRef.current) {
      scrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById(`block-${currentBlockId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [currentBlockId]);

  // Apply check states to blocks and postProduction
  const applyChecks = useCallback((checks: CheckState[]) => {
    const checkMap = new Map(checks.map((c) => [c.cut_id, c]));

    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        cuts: block.cuts.map((cut) => {
          const state = checkMap.get(cut.id);
          if (!state) return cut;
          return {
            ...cut,
            checked: state.checked,
            checked_at: state.checked_at,
          };
        }),
      }))
    );

    setPostProduction((prev) =>
      prev.map((cut) => {
        const state = checkMap.get(cut.id);
        if (!state) return cut;
        return {
          ...cut,
          checked: state.checked,
          checked_at: state.checked_at,
        };
      })
    );
  }, []);

  // Polling every 3 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const headers: Record<string, string> = {};
        if (etagRef.current) {
          headers["If-None-Match"] = etagRef.current;
        }
        const res = await fetch("/api/checks", { headers });
        if (res.status === 304) return;
        if (!res.ok) return;
        const data = await res.json();
        etagRef.current = data.etag;
        applyChecks(data.checks);
      } catch {
        // silently retry on next interval
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [applyChecks]);

  // Optimistic toggle
  const handleToggle = useCallback(
    async (cutId: number, checked: boolean) => {
      // Optimistic update
      const now = new Date().toISOString();
      const updateCut = (cut: Cut) =>
        cut.id === cutId
          ? { ...cut, checked, checked_at: checked ? now : null }
          : cut;

      setBlocks((prev) =>
        prev.map((block) => ({
          ...block,
          cuts: block.cuts.map(updateCut),
        }))
      );
      setPostProduction((prev) => prev.map(updateCut));

      // Send to server
      try {
        await fetch("/api/checks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cut_id: cutId, checked }),
        });
        // Reset etag to force next poll to refresh
        etagRef.current = "";
      } catch {
        // Revert on error
        setBlocks((prev) =>
          prev.map((block) => ({
            ...block,
            cuts: block.cuts.map((c) =>
              c.id === cutId ? { ...c, checked: !checked } : c
            ),
          }))
        );
        setPostProduction((prev) =>
          prev.map((c) =>
            c.id === cutId ? { ...c, checked: !checked } : c
          )
        );
      }
    },
    []
  );

  return (
    <div className="min-h-screen pb-20">
      <ProgressHeader blocks={blocks} postProduction={postProduction} />

      <div className="px-3 py-4 space-y-3 max-w-lg mx-auto">
        {blocks.map((block) => (
          <ScheduleBlock
            key={block.id}
            block={block}
            isCurrentBlock={block.id === currentBlockId}
            onToggle={handleToggle}
          />
        ))}

        <PostProductionSection
          cuts={postProduction}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
}
