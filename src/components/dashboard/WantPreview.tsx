"use client";

import { wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatKRW } from "@/lib/formatters";
import { getWantCategoryLabel, getWantStatusLabel } from "@/lib/labels";
import type { WantItem } from "@/types";

function getStoredWants(value: unknown): WantItem[] {
  return Array.isArray(value) ? (value as WantItem[]) : wants;
}

export function WantPreview() {
  const [storedWants] = useLocalStorage<unknown>("aiop:wants", wants);
  const items = getStoredWants(storedWants);
  const previewItems = items.slice(0, 5);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">구매 목표 미리보기</h3>
          <p className="text-sm text-zinc-500">최근에 추가한 구매 목표를 보여줍니다.</p>
        </div>
      </div>
      <div className="space-y-3">
        {previewItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
            아직 추가한 구매 목표가 없습니다.
          </div>
        ) : null}
        {previewItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-zinc-100">{item.name}</p>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getWantCategoryLabel(item.category)}</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">{getWantStatusLabel(item.status)}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{formatKRW(item.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-zinc-50">{item.score}</p>
              <p className="text-xs text-zinc-500">판단 점수</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
