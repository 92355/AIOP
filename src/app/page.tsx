"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AssetSnapshot } from "@/components/dashboard/AssetSnapshot";
import { RecentInsights } from "@/components/dashboard/RecentInsights";
import { SubscriptionSummary } from "@/components/dashboard/SubscriptionSummary";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { WantPreview } from "@/components/dashboard/WantPreview";
import { AssetCalculatorView } from "@/components/calculator/AssetCalculatorView";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { BookInsightsView } from "@/components/insights/BookInsightsView";
import { AddNoteModal } from "@/components/notes/AddNoteModal";
import { NotesInboxView } from "@/components/notes/NotesInboxView";
import { QuickAddModal, type QuickAddCategory } from "@/components/quick-add/QuickAddModal";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { RegretTrackerView } from "@/components/regret/RegretTrackerView";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { WantsView } from "@/components/wants/WantsView";
import { insights, notes, regrets, subscriptions, wants } from "@/data/mockData";
import type { Insight, Note, RegretItem, Subscription, ViewKey, WantItem } from "@/types";

const storageKeys = {
  wants: "aiop:wants",
  subscriptions: "aiop:subscriptions",
  insights: "aiop:insights",
  notes: "aiop:notes",
  regrets: "aiop:regret-items",
} as const;

export default function Home() {
  const [selectedView, setSelectedView] = useState<ViewKey>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<QuickAddCategory | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSelectQuickAddCategory(category: QuickAddCategory) {
    setQuickAddOpen(false);
    setActiveCategory(category);
  }

  function handleCloseItemModal() {
    setActiveCategory(null);
  }

  function handleAddedItem<T>(storageKey: string, item: T, fallbackItems: T[]) {
    prependLocalStorageItem(storageKey, item, fallbackItems);
    setRefreshKey((currentKey) => currentKey + 1);
    setActiveCategory(null);
  }

  return (
    <AppShell selectedView={selectedView} onSelectView={setSelectedView} onOpenQuickAdd={() => setQuickAddOpen(true)}>
      {selectedView === "dashboard" && <DashboardView key={`dashboard-${refreshKey}`} />}
      {selectedView === "wants" && <WantsView key={`wants-${refreshKey}`} />}
      {selectedView === "calculator" && <AssetCalculatorView key={`calculator-${refreshKey}`} />}
      {selectedView === "regret" && <RegretTrackerView key={`regret-${refreshKey}`} />}
      {selectedView === "subscriptions" && <SubscriptionsView key={`subscriptions-${refreshKey}`} />}
      {selectedView === "insights" && <BookInsightsView key={`insights-${refreshKey}`} />}
      {selectedView === "notes" && <NotesInboxView key={`notes-${refreshKey}`} />}

      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSelectCategory={handleSelectQuickAddCategory} />
      <AddWantModal isOpen={activeCategory === "want"} onClose={handleCloseItemModal} onAdd={(item) => handleAddedItem<WantItem>(storageKeys.wants, item, wants)} />
      <AddSubscriptionModal
        isOpen={activeCategory === "subscription"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<Subscription>(storageKeys.subscriptions, item, subscriptions)}
      />
      <AddInsightModal
        isOpen={activeCategory === "insight"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<Insight>(storageKeys.insights, item, insights)}
      />
      <AddRegretItemModal
        isOpen={activeCategory === "regret"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<RegretItem>(storageKeys.regrets, item, regrets)}
      />
      <AddNoteModal isOpen={activeCategory === "note"} onClose={handleCloseItemModal} onAdd={(item) => handleAddedItem<Note>(storageKeys.notes, item, notes)} />
    </AppShell>
  );
}

function prependLocalStorageItem<T>(key: string, item: T, fallbackItems: T[]) {
  if (typeof window === "undefined") return;

  let currentItems = fallbackItems;

  try {
    const storedValue = window.localStorage.getItem(key);
    const parsedValue = storedValue ? (JSON.parse(storedValue) as unknown) : null;

    if (Array.isArray(parsedValue)) {
      currentItems = parsedValue as T[];
    }
  } catch (error) {
    console.warn(`Failed to parse localStorage key: ${key}`, error);
  }

  try {
    window.localStorage.setItem(key, JSON.stringify([item, ...currentItems]));
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error);
  }
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">AIOP</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-zinc-50">내 삶의 컨트롤 센터</h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              내가 필요한 모든 것을 하나의 페이지에서 관리한다.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            오늘은 구매 판단 2개와 구독 리뷰 1개를 보면 충분합니다.
          </div>
        </div>
      </section>
      <SummaryCards />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WantPreview />
        <AssetSnapshot />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SubscriptionSummary />
        <RecentInsights />
      </div>
    </div>
  );
}
