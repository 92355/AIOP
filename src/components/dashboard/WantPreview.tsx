"use client";

import { useEffect, useState } from "react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { formatKRW } from "@/lib/formatters";
import { getWantCategoryLabel, getWantStatusLabel } from "@/lib/labels";
import { getWants } from "@/app/wants/actions";
import type { WantItem } from "@/types";

export function WantPreview() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useState<WantItem[]>([]);

  useEffect(() => {
    getWants().then(setItems).catch(console.error);
  }, []);

  const previewItems = items.slice(0, 5);

  return (
    <section className={`flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">최근 구매 목표</h3>
          {isCompact ? null : <p className="text-sm text-zinc-500">최근에 추가한 구매 목표를 보여줍니다.</p>}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {previewItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
            아직 추가한 구매 목표가 없습니다.
          </div>
        ) : null}
        {previewItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 truncate font-medium text-zinc-100">{item.name}</p>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getWantCategoryLabel(item.category)}</span>
                {isCompact ? null : <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">{getWantStatusLabel(item.status)}</span>}
              </div>
              <p className="mt-1 text-sm text-zinc-500">{formatKRW(item.price)}</p>
            </div>
            <div className="text-right">
              <p className={isCompact ? "text-lg font-semibold text-zinc-50" : "text-xl font-semibold text-zinc-50"}>{item.score}</p>
              {isCompact ? null : <p className="text-xs text-zinc-500">판단 점수</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
