import { Trash2 } from "lucide-react";
import type { WantItem, WantStatus } from "@/types";
import { formatCurrency, formatKRW } from "@/lib/formatters";
import { getWantCategoryLabel, getWantStatusLabel } from "@/lib/labels";
import { getWantScoreLabel } from "@/lib/wants";
import { useCompactMode } from "@/contexts/CompactModeContext";

type WantCardProps = {
  item: WantItem;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: WantStatus) => void;
};

const statusOrder: WantStatus[] = ["thinking", "planned", "bought", "skipped"];

const statusClassName: Record<WantStatus, string> = {
  thinking: "bg-zinc-800 text-zinc-300",
  planned: "bg-blue-400/10 text-blue-300",
  bought: "bg-emerald-400/10 text-emerald-300",
  skipped: "bg-red-400/10 text-red-300",
};

export function WantCard({ item, onDelete, onStatusChange }: WantCardProps) {
  const { isCompact } = useCompactMode();

  function handleStatusClick() {
    if (!onStatusChange) return;
    const currentIndex = statusOrder.indexOf(item.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(item.id, nextStatus);
  }

  return (
    <article className={`relative rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{getWantCategoryLabel(item.category)}</p>
          <h3 className="mt-2 truncate text-xl font-semibold text-zinc-50">{item.name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isCompact ? null : (
            <button
              type="button"
              onClick={handleStatusClick}
              title="클릭하여 상태 변경"
              className={`rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${statusClassName[item.status]}`}
            >
              {getWantStatusLabel(item.status)}
            </button>
          )}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`${item.name} 삭제`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <p className={`mt-4 font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>{item.currency === "USD" ? formatCurrency(item.price, "USD") : formatKRW(item.price)}</p>
      <p className={`mt-3 text-sm leading-6 text-zinc-400 ${isCompact ? "line-clamp-1" : "line-clamp-2 min-h-12"}`}>{item.reason}</p>
      <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">구매 판단 점수</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">
            {item.score} <span className="text-sm font-medium text-zinc-400">({getWantScoreLabel(item.score)})</span>
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">필요 자산</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">{formatKRW(item.requiredCapital)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">목표 구매일</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{item.targetDate || "-"}</p>
        </div>
      </div>
      <div className={`mt-3 grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">목표 기간</p>
          <p className="mt-1 text-base font-semibold text-zinc-100">{item.targetMonths ? `${item.targetMonths}개월` : "-"}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">월 필요 현금흐름</p>
          <p className="mt-1 text-base font-semibold text-zinc-100">
            {item.monthlyCashflowNeeded && item.monthlyCashflowNeeded > 0 ? formatKRW(item.monthlyCashflowNeeded) : "-"}
          </p>
        </div>
      </div>
    </article>
  );
}
