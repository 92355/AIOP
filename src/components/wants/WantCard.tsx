import { Trash2 } from "lucide-react";
import type { WantItem } from "@/types";
import { formatKRW } from "@/lib/formatters";
import { getWantCategoryLabel, getWantStatusLabel } from "@/lib/labels";
import { useCompactMode } from "@/contexts/CompactModeContext";

type WantCardProps = {
  item: WantItem;
  onDelete?: (id: string) => void;
};

export function WantCard({ item, onDelete }: WantCardProps) {
  const { isCompact } = useCompactMode();

  return (
    <article className={`relative rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{getWantCategoryLabel(item.category)}</p>
          <h3 className="mt-2 truncate text-xl font-semibold text-zinc-50">{item.name}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isCompact ? null : <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">{getWantStatusLabel(item.status)}</span>}
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
      <p className={`mt-4 font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>{formatKRW(item.price)}</p>
      <p className={`mt-3 text-sm leading-6 text-zinc-400 ${isCompact ? "line-clamp-1" : "line-clamp-2 min-h-12"}`}>{item.reason}</p>
      <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className={`rounded-2xl bg-zinc-950/70 p-3 ${isCompact ? "hidden" : ""}`}>
          <p className="text-xs text-zinc-500">AI 판단 점수</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{item.score}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">필요 자산</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">{formatKRW(item.requiredCapital)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-3">
          <p className="text-xs text-zinc-500">목표 구매일</p>
          <p className="mt-1 text-lg font-semibold text-zinc-100">{item.targetDate}</p>
        </div>
      </div>
    </article>
  );
}
