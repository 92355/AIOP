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
      <h3 className="text-lg font-semibold text-zinc-50">Subscription Summary</h3>
      <p className="mt-1 text-sm text-zinc-500">Recurring spending is grouped by status from localStorage.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">Monthly total</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50">{formatKRW(summary.total)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">Keep</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{summary.keepCount} items</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">Review</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{summary.reviewCount} items</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">Cancel</p>
          <p className="mt-1 text-xl font-semibold text-red-300">{summary.cancelCount} items</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
            No subscriptions have been added yet.
          </span>
        ) : null}
        {summary.actionItems.length === 0 && items.length > 0 ? (
          <span className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
            No subscriptions need review right now.
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
