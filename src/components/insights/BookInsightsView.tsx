"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { insights } from "@/data/mockData";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { InsightCard } from "@/components/insights/InsightCard";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useSearchContext, normalizeSearchTerm } from "@/contexts/SearchContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Insight } from "@/types";

export function BookInsightsView() {
  const { isCompact } = useCompactMode();
  const { searchQuery } = useSearchContext();
  const [items, setItems] = useLocalStorage<Insight[]>("aiop:insights", insights);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const searchTerm = normalizeSearchTerm(searchQuery);
  const filteredItems = searchTerm
    ? items.filter((item) =>
        [item.title, item.keySentence, item.actionItem, item.relatedGoal, ...item.tags]
          .filter((value): value is string => typeof value === "string")
          .some((value) => value.toLowerCase().includes(searchTerm)),
      )
    : items;

  const handleAdd = (item: Insight) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const handleDelete = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>인사이트 보관함</h2>
          {isCompact ? null : <p className="mt-2 text-zinc-500">읽고 본 내용을 내 행동과 소비 판단으로 연결합니다.</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          인사이트 추가
        </button>
      </div>
      <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft xl:col-span-2">
            {items.length === 0
              ? "등록된 인사이트가 없습니다. 책, 영상, 아티클에서 얻은 실행 문장을 추가하세요."
              : `"${searchQuery}" 검색 결과가 없습니다.`}
          </div>
        ) : null}
        {filteredItems.map((item) => (
          <InsightCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      <AddInsightModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
