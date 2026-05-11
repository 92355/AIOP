"use client";

import { useMemo } from "react";
import { subscriptions } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatKRW } from "@/lib/formatters";
import type { Subscription } from "@/types";

function getStoredSubscriptions(value: unknown): Subscription[] {
  return Array.isArray(value) ? (value as Subscription[]) : subscriptions;
}

export function SubscriptionSummary() {
  const [storedSubscriptions] = useLocalStorage<unknown>("aiop:subscriptions", subscriptions);
  const items = getStoredSubscriptions(storedSubscriptions);
  const summary = useMemo(() => {
    return {
      total: items.reduce((sum, item) => sum + item.monthlyPrice, 0),
      keepCount: items.filter((item) => item.status === "keep").length,
      reviewCount: items.filter((item) => item.status === "review").length,
      cancelCount: items.filter((item) => item.status === "cancel").length,
      actionItems: items.filter((item) => item.status === "review" || item.status === "cancel").slice(0, 4),
    };
  }, [items]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-zinc-50">구독 요약</h3>
      <p className="mt-1 text-sm text-zinc-500">반복 지출을 상태별로 정리합니다.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">월 합계</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50">{formatKRW(summary.total)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">유지</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{summary.keepCount}개</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">검토</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{summary.reviewCount}개</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">해지</p>
          <p className="mt-1 text-xl font-semibold text-red-300">{summary.cancelCount}개</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
            아직 추가한 구독이 없습니다.
          </span>
        ) : null}
        {summary.actionItems.length === 0 && items.length > 0 ? (
          <span className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
            지금 검토할 구독이 없습니다.
          </span>
        ) : null}
        {summary.actionItems.map((item) => (
          <span key={item.id} className="rounded-full border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
            {item.service}
          </span>
        ))}
      </div>
    </section>
  );
}
