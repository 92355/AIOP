"use client";

import { useMemo } from "react";
import { Banknote, BookMarked, CreditCard, NotebookTabs, Sparkles } from "lucide-react";
import { insights, notes, subscriptions, wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCompactKRW, formatKRW } from "@/lib/formatters";
import type { Insight, Note, Subscription, WantItem } from "@/types";

function getStoredArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export function SummaryCards() {
  const [storedWants] = useLocalStorage<unknown>("aiop:wants", wants);
  const [storedSubscriptions] = useLocalStorage<unknown>("aiop:subscriptions", subscriptions);
  const [storedInsights] = useLocalStorage<unknown>("aiop:insights", insights);
  const [storedNotes] = useLocalStorage<unknown>("aiop:notes", notes);

  const wantItems = getStoredArray<WantItem>(storedWants, wants);
  const subscriptionItems = getStoredArray<Subscription>(storedSubscriptions, subscriptions);
  const insightItems = getStoredArray<Insight>(storedInsights, insights);
  const noteItems = getStoredArray<Note>(storedNotes, notes);

  const monthlyTotal = useMemo(
    () => subscriptionItems.reduce((sum, item) => sum + item.monthlyPrice, 0),
    [subscriptionItems],
  );
  const coverableSpend = useMemo(() => wantItems.reduce((sum, item) => sum + item.price, 0), [wantItems]);
  const inboxNoteCount = useMemo(
    () => noteItems.filter((item) => (item.status ?? "inbox") === "inbox").length,
    [noteItems],
  );

  const cards = [
    {
      label: "구매 목표",
      value: `${wantItems.length}개`,
      helper: "기록 중인 구매 목표",
      icon: Sparkles,
    },
    {
      label: "월 구독비",
      value: formatKRW(monthlyTotal),
      helper: "매달 반복되는 지출",
      icon: CreditCard,
    },
    {
      label: "목표 지출",
      value: formatCompactKRW(coverableSpend),
      helper: "구매 목표 총액",
      icon: Banknote,
    },
    {
      label: "인사이트",
      value: `${insightItems.length}개`,
      helper: "저장한 책, 영상, 생각",
      icon: BookMarked,
    },
    {
      label: "메모함",
      value: `${inboxNoteCount}개`,
      helper: "아직 정리하지 않은 메모",
      icon: NotebookTabs,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
