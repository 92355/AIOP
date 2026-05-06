import { subscriptions } from "@/data/mockData";
import { formatKRW } from "@/lib/calculations";

const total = subscriptions.reduce((sum, item) => sum + item.monthlyPrice, 0);
const keep = subscriptions.filter((item) => item.status === "keep");
const review = subscriptions.filter((item) => item.status !== "keep");

export function SubscriptionSummary() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-zinc-50">Monthly Subscription Summary</h3>
      <p className="mt-1 text-sm text-zinc-500">반복 지출을 사용 빈도와 가치 점수로 봅니다.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">총 월 구독비</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50">{formatKRW(total)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">유지 추천</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{keep.length}개</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">해지 후보</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{review.length}개</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {subscriptions.slice(0, 4).map((item) => (
          <span key={item.id} className="rounded-full border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
            {item.service}
          </span>
        ))}
      </div>
    </section>
  );
}
