"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { regrets } from "@/data/mockData";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { RegretCard } from "@/components/regret/RegretCard";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { RegretItem } from "@/types";

export function RegretTrackerView() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useLocalStorage<RegretItem[]>("aiop:regret-items", regrets);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = (item: RegretItem) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const handleDelete = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>그때 살걸 기록장</h2>
          {isCompact ? null : <p className="mt-2 text-zinc-500">관심 있었던 자산과 물건을 결과가 아니라 판단 과정으로 복기합니다.</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          후회 항목 추가
        </button>
      </div>
      <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft xl:col-span-2">
            등록된 후회 기록이 없습니다. 관심 있었던 자산이나 물건을 추가하면 놓친 손익을 계산합니다.
          </div>
        ) : null}
        {items.map((item) => (
          <RegretCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      <AddRegretItemModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
