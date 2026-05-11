"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { regrets } from "@/data/mockData";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { RegretCard } from "@/components/regret/RegretCard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { RegretItem } from "@/types";

export function RegretTrackerView() {
  const [items, setItems] = useLocalStorage<RegretItem[]>("aiop:regret-items", regrets);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = (item: RegretItem) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  const handleDelete = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-zinc-50">그때 살걸 기록장</h2>
          <p className="mt-2 text-zinc-500">관심 있었던 자산과 물건을 결과가 아니라 판단 과정으로 복기합니다.</p>
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
      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <RegretCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      <AddRegretItemModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
