"use client";

import { insights } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getInsightTypeLabel } from "@/lib/labels";
import type { Insight } from "@/types";

function getStoredInsights(value: unknown): Insight[] {
  return Array.isArray(value) ? (value as Insight[]) : insights;
}

export function RecentInsights() {
  const [storedInsights] = useLocalStorage<unknown>("aiop:insights", insights);
  const items = getStoredInsights(storedInsights);
  const recentItems = items.slice(0, 3);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-zinc-50">최근 인사이트</h3>
      <p className="mt-1 text-sm text-zinc-500">최근에 저장한 인사이트를 보여줍니다.</p>
      <div className="mt-4 space-y-3">
        {recentItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
            아직 추가한 인사이트가 없습니다.
          </div>
        ) : null}
        {recentItems.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium text-zinc-100">{item.title}</h4>
              <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getInsightTypeLabel(item.sourceType)}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{item.keySentence}</p>
            <p className="mt-2 text-sm text-emerald-300">{item.actionItem}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
