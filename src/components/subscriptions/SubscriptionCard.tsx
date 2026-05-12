"use client";

import { Trash2 } from "lucide-react";
import type { Subscription, SubscriptionStatus } from "@/types";
import { formatKRW } from "@/lib/formatters";
import { getSubscriptionCategoryLabel, getSubscriptionStatusLabel, getUsageLabel } from "@/lib/labels";
import { useCompactMode } from "@/contexts/CompactModeContext";

type SubscriptionCardProps = {
  item: Subscription;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: SubscriptionStatus) => void;
};

const statuses: SubscriptionStatus[] = ["keep", "review", "cancel"];

export function SubscriptionCard({ item, onDelete, onStatusChange }: SubscriptionCardProps) {
  const { isCompact } = useCompactMode();
  const statusStyle = {
    keep: "bg-emerald-400/10 text-emerald-300",
    review: "bg-zinc-800 text-zinc-300",
    cancel: "bg-red-400/10 text-red-300",
  }[item.status];

  return (
    <article className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-zinc-50">{item.service}</h3>
          <p className={`mt-1 text-sm text-zinc-500 ${isCompact ? "line-clamp-1" : ""}`}>{getSubscriptionCategoryLabel(item.category)} / {getUsageLabel(item.usage)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isCompact ? null : <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>{getSubscriptionStatusLabel(item.status)}</span>}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`${item.service} 삭제`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      {onStatusChange ? (
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(item.id, status)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                item.status === status ? "bg-emerald-400 text-zinc-950" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {getSubscriptionStatusLabel(status)}
            </button>
          ))}
        </div>
      ) : null}
      <div className={isCompact ? "mt-4 flex items-end justify-between" : "mt-6 flex items-end justify-between"}>
        <div>
          <p className="text-sm text-zinc-500">월 금액</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-50">{formatKRW(item.monthlyPrice)}</p>
          {item.billingDay != null ? (
            <p className="mt-1 text-xs text-zinc-500">매월 {item.billingDay}일 결제</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">가치 점수</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{item.valueScore}</p>
        </div>
      </div>
    </article>
  );
}
