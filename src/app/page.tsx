"use client";

import { useState } from "react";
import { AssetCalculatorView } from "@/components/calculator/AssetCalculatorView";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { BookInsightsView } from "@/components/insights/BookInsightsView";
import { DashboardGrid } from "@/components/layout/grid/DashboardGrid";
import { AppShell } from "@/components/layout/AppShell";
import { AddNoteModal } from "@/components/notes/AddNoteModal";
import { NotesInboxView } from "@/components/notes/NotesInboxView";
import { QuickAddModal, type QuickAddCategory } from "@/components/quick-add/QuickAddModal";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { RegretTrackerView } from "@/components/regret/RegretTrackerView";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { TodoView } from "@/components/todos/TodoView";
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
      {selectedView === "todos" && <TodoView key={`todos-${refreshKey}`} />}

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
  return <DashboardGrid />;
}
