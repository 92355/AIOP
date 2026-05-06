import type { WantItem } from "@/types";
import { formatKRW } from "@/lib/calculations";

type WantCardProps = {
  item: WantItem;
};

export function WantCard({ item }: WantCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-50">{item.name}</h3>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">{item.status}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-50">{formatKRW(item.price)}</p>
      <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">{item.reason}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-zinc-950/70 p-3">
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
