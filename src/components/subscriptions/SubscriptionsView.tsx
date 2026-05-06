import { subscriptions } from "@/data/mockData";
import { formatKRW } from "@/lib/calculations";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";

const total = subscriptions.reduce((sum, item) => sum + item.monthlyPrice, 0);
const keep = subscriptions.filter((item) => item.status === "keep");
const review = subscriptions.filter((item) => item.status !== "keep");

export function SubscriptionsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-zinc-50">월 구독 운영판</h2>
        <p className="mt-2 text-zinc-500">구독을 비용이 아니라 사용 빈도와 효용으로 관리합니다.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
          <p className="text-sm text-zinc-500">이번 달 총 구독비</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">{formatKRW(total)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
          <p className="text-sm text-zinc-500">유지 추천 구독</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{keep.length}개</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
          <p className="text-sm text-zinc-500">해지 후보 구독</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">{review.length}개</p>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {subscriptions.map((item) => (
          <SubscriptionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
