import { Banknote, BookMarked, CreditCard, Sparkles } from "lucide-react";
import { subscriptions, wants, insights } from "@/data/mockData";
import { formatCompactKRW, formatKRW } from "@/lib/calculations";

const monthlyTotal = subscriptions.reduce((sum, item) => sum + item.monthlyPrice, 0);
const coverableSpend = wants.reduce((sum, item) => sum + item.price, 0);

const cards = [
  {
    label: "사고 싶은 항목",
    value: `${wants.length}개`,
    helper: "판단 대기 및 목표화 항목",
    icon: Sparkles,
  },
  {
    label: "이번 달 구독비",
    value: formatKRW(monthlyTotal),
    helper: "리뷰 후보 포함",
    icon: CreditCard,
  },
  {
    label: "자산 커버 소비",
    value: formatCompactKRW(coverableSpend),
    helper: "Want list 총 예상 비용",
    icon: Banknote,
  },
  {
    label: "최근 인사이트",
    value: `${insights.length}개`,
    helper: "책, 영상, 생각 기록",
    icon: BookMarked,
  },
];

export function SummaryCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">{card.label}</p>
                <strong className="mt-2 block text-2xl font-semibold text-zinc-50">{card.value}</strong>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-500">{card.helper}</p>
          </article>
        );
      })}
    </section>
  );
}
