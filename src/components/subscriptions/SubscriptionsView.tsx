"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { subscriptions } from "@/data/mockData";
import { formatKRW } from "@/lib/formatters";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { useCompactMode } from "@/contexts/CompactModeContext";
import type { Subscription, SubscriptionStatus } from "@/types";

export function SubscriptionsView() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useLocalStorage<Subscription[]>("aiop:subscriptions", subscriptions);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const summary = useMemo(() => {
    return {
      total: items.reduce((sum, item) => sum + item.monthlyPrice, 0),
      keepCount: items.filter((item) => item.status === "keep").length,
      reviewCount: items.filter((item) => item.status === "review").length,
      cancelCount: items.filter((item) => item.status === "cancel").length,
    };
  }, [items]);

  function handleAdd(item: Subscription) {
    setItems((prevItems) => [item, ...prevItems]);
  }

  function handleDelete(id: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  function handleStatusChange(id: string, status: SubscriptionStatus) {
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  return (
    <div className={isCompact ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>월 구독 운영판</h2>
          {isCompact ? null : <p className="mt-2 text-zinc-500">구독을 비용이 아니라 사용 빈도와 효용으로 관리합니다.</p>}
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          구독 추가
        </button>
      </div>
      <section className={`grid gap-3 ${isCompact ? "grid-cols-2" : "md:grid-cols-4"}`}>
        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
          <p className="text-sm text-zinc-500">이번 달 총 구독비</p>
          <p className={`mt-2 font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-3xl"}`}>{formatKRW(summary.total)}</p>
        </div>
        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "hidden" : "p-5"}`}>
          <p className="text-sm text-zinc-500">유지 추천 구독</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{summary.keepCount}개</p>
        </div>
        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
          <p className="text-sm text-zinc-500">검토 중 구독</p>
          <p className={`mt-2 font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-3xl"}`}>{summary.reviewCount}개</p>
        </div>
        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "hidden" : "p-5"}`}>
          <p className="text-sm text-zinc-500">해지 예정 구독</p>
          <p className="mt-2 text-3xl font-semibold text-red-300">{summary.cancelCount}개</p>
        </div>
      </section>
      <div className={`grid gap-4 ${isCompact ? "" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft lg:col-span-2 xl:col-span-3">
            등록된 구독이 없습니다. 구독을 추가하면 월 합계와 상태별 개수가 자동으로 갱신됩니다.
          </div>
        ) : null}
        {items.map((item) => (
          <SubscriptionCard key={item.id} item={item} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        ))}
      </div>
      <AddSubscriptionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
