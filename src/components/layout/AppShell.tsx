"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { UpdateNoticeModal } from "@/components/layout/UpdateNoticeModal";
import { AddNoteModal } from "@/components/notes/AddNoteModal";
import { QuickAddModal, type QuickAddCategory } from "@/components/quick-add/QuickAddModal";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { CompactModeProvider, useCompactMode } from "@/contexts/CompactModeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { insights, notes, regrets, subscriptions, wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { prependLocalStorageItem } from "@/lib/storage";
import type { Insight, Note, RegretItem, Subscription, WantItem } from "@/types";

type AppShellProps = {
  children: React.ReactNode;
};

type ThemeMode = "dark" | "light";

const storageKeys = {
  wants: "aiop:wants",
  subscriptions: "aiop:subscriptions",
  insights: "aiop:insights",
  notes: "aiop:notes",
  regrets: "aiop:regret-items",
} as const;

const categoryRoutes: Record<QuickAddCategory, string> = {
  want: "/wants",
  subscription: "/subscriptions",
  insight: "/insights",
  regret: "/regret",
  note: "/notes",
};

export function AppShell({ children }: AppShellProps) {
  return (
    <CompactModeProvider>
      <LayoutProvider>
        <SearchProvider>
          <AppShellContent>{children}</AppShellContent>
        </SearchProvider>
      </LayoutProvider>
    </CompactModeProvider>
  );
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>("aiop-theme-mode", "dark");
  const [updateNoticeOpen, setUpdateNoticeOpen] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<QuickAddCategory | null>(null);
  const { isCompact } = useCompactMode();
  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((currentThemeMode) => (currentThemeMode === "dark" ? "light" : "dark"));
  };

  function handleSelectQuickAddCategory(category: QuickAddCategory) {
    setQuickAddOpen(false);
    setActiveCategory(category);
  }

  function handleCloseItemModal() {
    setActiveCategory(null);
  }

  function handleCloseUpdateNotice() {
    setUpdateNoticeOpen(false);
  }

  function handleAddedItem<T>(targetHref: string, storageKey: string, item: T, fallbackItems: T[]) {
    prependLocalStorageItem(storageKey, item, fallbackItems);
    setActiveCategory(null);

    if (pathname === targetHref) {
      router.refresh();
      return;
    }

    router.push(targetHref);
  }

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${isCompact ? "" : "md:flex"} ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {isCompact ? null : <Sidebar />}
      <div className="min-w-0 flex-1">
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />
        <main
          className={`thin-scrollbar min-h-0 ${
            isCompact
              ? "mx-auto max-w-md px-3 py-4 pb-24 md:h-[calc(100vh-88px)] md:overflow-y-auto"
              : "px-5 py-6 md:h-[calc(100vh-88px)] md:overflow-y-auto md:px-8"
          }`}
        >
          <div className={isCompact ? "space-y-4" : undefined}>{children}</div>
        </main>
      </div>
      {isCompact ? <BottomTabBar /> : null}
      <UpdateNoticeModal isOpen={updateNoticeOpen} onClose={handleCloseUpdateNotice} />
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSelectCategory={handleSelectQuickAddCategory} />
      <AddWantModal
        isOpen={activeCategory === "want"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<WantItem>(categoryRoutes.want, storageKeys.wants, item, wants)}
      />
      <AddSubscriptionModal
        isOpen={activeCategory === "subscription"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<Subscription>(categoryRoutes.subscription, storageKeys.subscriptions, item, subscriptions)}
      />
      <AddInsightModal
        isOpen={activeCategory === "insight"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<Insight>(categoryRoutes.insight, storageKeys.insights, item, insights)}
      />
      <AddRegretItemModal
        isOpen={activeCategory === "regret"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<RegretItem>(categoryRoutes.regret, storageKeys.regrets, item, regrets)}
      />
      <AddNoteModal
        isOpen={activeCategory === "note"}
        onClose={handleCloseItemModal}
        onAdd={(item) => handleAddedItem<Note>(categoryRoutes.note, storageKeys.notes, item, notes)}
      />
    </div>
  );
}
