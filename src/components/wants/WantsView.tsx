"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { wants } from "@/data/mockData";
import { WantCard } from "@/components/wants/WantCard";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getWantCategoryLabel } from "@/lib/labels";
import type { WantItem } from "@/types";

const filters: Array<"All" | WantItem["category"]> = ["All", "Productivity", "Lifestyle", "Investment", "Hobby"];

export function WantsView() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useLocalStorage<WantItem[]>("aiop:wants", wants);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function handleAdd(item: WantItem) {
    setItems((prevItems) => [item, ...prevItems]);
  }

  function handleDelete(id: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>구매 욕구를 운영 가능한 목표로 바꾸기</h2>
          {isCompact ? null : <p className="mt-2 text-zinc-500">가격, 이유, 판단 점수, 필요한 자산 규모를 한 번에 봅니다.</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          구매 목표 추가
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={`rounded-2xl border px-4 py-2 text-sm ${
              index === 0
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {filter === "All" ? "전체" : getWantCategoryLabel(filter)}
          </button>
        ))}
      </div>
      <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft xl:col-span-2">
            등록된 구매 목표가 없습니다. 사고 싶은 항목을 추가하면 필요한 자산과 월 현금흐름을 계산합니다.
          </div>
        ) : null}
        {items.map((item) => (
          <WantCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      <AddWantModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
