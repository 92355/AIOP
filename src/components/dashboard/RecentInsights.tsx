"use client";

import { useEffect, useState } from "react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { getInsightTypeLabel } from "@/lib/labels";
import { getInsights } from "@/app/insights/actions";
import type { Insight } from "@/types";

export function RecentInsights() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useState<Insight[]>([]);

  useEffect(() => {
    getInsights().then(setItems).catch(console.error);
  }, []);

  const recentItems = items.slice(0, 3);

  return (
    <section className={`flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <h3 className="text-lg font-semibold text-zinc-50">최근 인사이트</h3>
      {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">최근에 저장한 인사이트를 보여줍니다.</p>}
      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {recentItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
            아직 추가한 인사이트가 없습니다.
          </div>
        ) : null}
        {recentItems.map((item) => (
          <article key={item.id} className={`rounded-2xl border border-zinc-800 bg-zinc-950/60 ${isCompact ? "p-3" : "p-4"}`}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="min-w-0 truncate font-medium text-zinc-100">{item.title}</h4>
              <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getInsightTypeLabel(item.sourceType)}</span>
            </div>
            <p className={`mt-3 text-sm leading-6 text-zinc-300 ${isCompact ? "line-clamp-1" : "line-clamp-2"}`}>{item.keySentence}</p>
            {isCompact ? null : <p className="mt-2 line-clamp-2 text-sm text-emerald-300">{item.actionItem}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
