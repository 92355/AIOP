"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { RegretCard } from "@/components/regret/RegretCard";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { confirmDelete } from "@/lib/confirmDelete";
import { createRegretItem, deleteRegretItem } from "@/app/regret/actions";
import type { RegretItem } from "@/types";

type RegretTrackerViewProps = { initialItems: RegretItem[] };

export function RegretTrackerView({ initialItems }: RegretTrackerViewProps) {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useState<RegretItem[]>(initialItems);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = async (item: RegretItem) => {
    setItems((prev) => [item, ...prev]);
    await createRegretItem(item);
  };

  const handleDelete = async (id: string) => {
    const targetItem = items.find((item) => item.id === id);
    if (!confirmDelete(targetItem?.name ?? "후회 기록")) return;

    setItems((prev) => prev.filter((item) => item.id !== id));
    await deleteRegretItem(id);
  };

  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>그때 살걸 기록장</h2>
          {isCompact ? null : <p className="mt-2 text-zinc-500">라고할때 살걸... 이라고 할때 살걸... </p>}
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
