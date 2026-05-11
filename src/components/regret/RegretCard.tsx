"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { useCompactMode } from "@/contexts/CompactModeContext";
import type { RegretItem } from "@/types";

type RegretCardProps = {
  item: RegretItem;
  onDelete?: (id: string) => void;
};

export function RegretCard({ item, onDelete }: RegretCardProps) {
  const { isCompact } = useCompactMode();
  const resultPrefix = item.resultPercent > 0 ? "+" : "";
  const profitPrefix = item.profitAmount > 0 ? "+" : "";
  const resultClassName =
    item.resultPercent >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-zinc-800 text-zinc-300";

  return (
    <article className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-xl font-semibold text-zinc-50">{item.name}</h3>
            {item.symbol ? <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{item.symbol}</span> : null}
          </div>
          <p className={`mt-1 text-sm text-zinc-500 ${isCompact ? "line-clamp-1" : ""}`}>
            {item.assetType}
            {item.watchedAt ? ` / ${formatDate(item.watchedAt)}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${resultClassName}`}>
            {resultPrefix}
            {formatNumber(Number(item.resultPercent.toFixed(1)))}%
          </span>
          {onDelete ? (
            <button
              aria-label={`${item.name} 삭제`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
              type="button"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <p className={`mt-4 text-sm leading-6 text-zinc-400 ${isCompact ? "line-clamp-1" : "line-clamp-2"}`}>{item.note}</p>

      <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">관심 가격</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{formatCurrency(item.watchedPrice, item.currency)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">현재 가격</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{formatCurrency(item.currentPrice, item.currency)}</p>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${isCompact ? "grid-cols-1" : "lg:grid-cols-2"}`}>
        <div className={`rounded-2xl border border-zinc-800 p-4 ${isCompact ? "hidden" : ""}`}>
          <p className="text-sm text-zinc-500">수량</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{formatNumber(item.quantity)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 p-4">
          <p className="text-sm text-zinc-500">놓친 손익</p>
          <p className={`mt-1 text-lg font-semibold ${item.profitAmount >= 0 ? "text-emerald-300" : "text-zinc-100"}`}>
            {profitPrefix}
            {formatCurrency(item.profitAmount, item.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
