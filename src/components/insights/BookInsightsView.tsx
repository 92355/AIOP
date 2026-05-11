"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { insights } from "@/data/mockData";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { InsightCard } from "@/components/insights/InsightCard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Insight } from "@/types";

export function BookInsightsView() {
  const [items, setItems] = useLocalStorage<Insight[]>("aiop:insights", insights);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = (item: Insight) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const handleDelete = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-zinc-50">인사이트 보관함</h2>
          <p className="mt-2 text-zinc-500">읽고 본 내용을 내 행동과 소비 판단으로 연결합니다.</p>
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
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <InsightCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      <AddInsightModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
