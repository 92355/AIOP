import type { Subscription } from "@/types";
import { formatKRW } from "@/lib/calculations";

type SubscriptionCardProps = {
  item: Subscription;
};

export function SubscriptionCard({ item }: SubscriptionCardProps) {
  const statusStyle = {
    keep: "bg-emerald-400/10 text-emerald-300",
    review: "bg-zinc-800 text-zinc-300",
    cancel: "bg-red-400/10 text-red-300",
  }[item.status];

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-zinc-50">{item.service}</h3>
          <p className="mt-1 text-sm text-zinc-500">{item.category} / {item.usage}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>{item.status}</span>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-zinc-500">월 금액</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-50">{formatKRW(item.monthlyPrice)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">가치 점수</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{item.valueScore}</p>
        </div>
      </div>
    </article>
  );
}
