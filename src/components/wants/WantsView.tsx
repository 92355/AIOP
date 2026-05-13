"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { WantCard } from "@/components/wants/WantCard";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useSearchContext, normalizeSearchTerm } from "@/contexts/SearchContext";
import { confirmDelete } from "@/lib/confirmDelete";
import { getWantCategoryLabel, getWantPriorityLabel, getWantStatusLabel } from "@/lib/labels";
import { calculateWantDecisionScore } from "@/lib/wants";
import { createWant, deleteWant, updateWant } from "@/app/wants/actions";
import type { WantItem, WantStatus } from "@/types";

type WantCategoryFilter = "All" | WantItem["category"];
type WantStatusFilter = "All" | WantStatus;
type WantsViewProps = { initialItems: WantItem[] };

const filters: WantCategoryFilter[] = ["All", "Productivity", "Lifestyle", "Investment", "Hobby"];
const statusFilters: WantStatusFilter[] = ["All", "thinking", "planned", "bought", "skipped"];

export function WantsView({ initialItems }: WantsViewProps) {
  const { isCompact } = useCompactMode();
  const { searchQuery } = useSearchContext();
  const [items, setItems] = useState<WantItem[]>(initialItems);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WantCategoryFilter>("All");
  const [selectedStatus, setSelectedStatus] = useState<WantStatusFilter>("All");
  const searchTerm = normalizeSearchTerm(searchQuery);
  const filteredItems = useMemo(
    () =>
      items
        .filter((item) => matchesCategoryFilter(item, selectedCategory) && matchesStatusFilter(item, selectedStatus) && matchesSearchTerm(item, searchTerm))
        .sort((left, right) => right.score - left.score),
    [items, searchTerm, selectedCategory, selectedStatus],
  );
  const hasActiveFilter = selectedCategory !== "All" || selectedStatus !== "All" || searchTerm.length > 0;

  async function handleAdd(item: WantItem) {
    setItems((prev) => [item, ...prev]);
    await createWant(item);
  }

  async function handleStatusChange(id: string, status: WantStatus) {
    const targetItem = items.find((item) => item.id === id);
    const nextScore = targetItem
      ? calculateWantDecisionScore({
          price: targetItem.price,
          priority: targetItem.priority,
          status,
          targetMonths: targetItem.targetMonths,
          monthlyCashflowNeeded: targetItem.monthlyCashflowNeeded,
          reason: targetItem.reason,
        })
      : undefined;

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status, score: nextScore ?? item.score } : item)));
    await updateWant(id, { status, ...(nextScore !== undefined ? { score: nextScore } : {}) });
  }

  async function handleDelete(id: string) {
    const targetItem = items.find((item) => item.id === id);
    if (!confirmDelete(targetItem?.name ?? "구매 목표")) return;

    setItems((prev) => prev.filter((item) => item.id !== id));
    await deleteWant(id);
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
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedCategory(filter)}
            className={`rounded-2xl border px-4 py-2 text-sm ${
              selectedCategory === filter
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {filter === "All" ? "전체" : getWantCategoryLabel(filter)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedStatus(filter)}
            className={`rounded-2xl border px-4 py-2 text-sm ${
              selectedStatus === filter
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {filter === "All" ? "전체 상태" : getWantStatusLabel(filter)}
          </button>
        ))}
      </div>
      <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-2"}`}>
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft xl:col-span-2">
            {items.length === 0
              ? "등록된 구매 목표가 없습니다. 사고 싶은 항목을 추가하면 필요한 자산과 월 현금흐름을 계산합니다."
              : hasActiveFilter
                ? "선택한 카테고리와 검색어에 맞는 구매 목표가 없습니다."
                : "선택한 카테고리에 해당하는 구매 목표가 없습니다."}
          </div>
        ) : null}
        {filteredItems.map((item) => (
          <WantCard key={item.id} item={item} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        ))}
      </div>
      <AddWantModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}

function matchesCategoryFilter(item: WantItem, selectedCategory: WantCategoryFilter) {
  return selectedCategory === "All" || item.category === selectedCategory;
}

function matchesStatusFilter(item: WantItem, selectedStatus: WantStatusFilter) {
  return selectedStatus === "All" || item.status === selectedStatus;
}

function matchesSearchTerm(item: WantItem, searchTerm: string) {
  if (!searchTerm) return true;

  const searchableText = [
    item.name,
    item.reason,
    getWantCategoryLabel(item.category),
    getWantStatusLabel(item.status),
    item.priority ? getWantPriorityLabel(item.priority) : "",
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchTerm);
}
