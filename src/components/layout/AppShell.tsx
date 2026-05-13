"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AddInsightModal } from "@/components/insights/AddInsightModal";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { UpdateNoticeModal } from "@/components/layout/UpdateNoticeModal";
import { AddNoteModal } from "@/components/notes/AddNoteModal";
import { QuickAddModal, type QuickAddCategory } from "@/components/quick-add/QuickAddModal";
import { AddRegretItemModal } from "@/components/regret/AddRegretItemModal";
import { AddRetroModal, type QuickRetroInput } from "@/components/retros/AddRetroModal";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { AddTodoModal } from "@/components/todos/AddTodoModal";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { CompactModeProvider, useCompactMode } from "@/contexts/CompactModeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { dispatchDashboardOptimisticEvent, type OptimisticCategory, type OptimisticPayloadMap } from "@/lib/dashboardOptimistic";
import { createId, createTodoFromTry, getLocalDateString } from "@/lib/retros";
import { createWant } from "@/app/wants/actions";
import { createSubscription } from "@/app/subscriptions/actions";
import { createInsight } from "@/app/insights/actions";
import { createRegretItem } from "@/app/regret/actions";
import { createNote } from "@/app/notes/actions";
import { createTodo } from "@/app/todos/actions";
import { addRetroItem } from "@/app/retros/actions";
import type { Insight, Note, RegretItem, RetroItem, Subscription, TodoItem, WantItem } from "@/types";
import type { DashboardLayout } from "@/types/layout";

type AppShellProps = {
  children: React.ReactNode;
  initialLayout: DashboardLayout;
};

type ThemeMode = "dark" | "light";


export function AppShell({ children, initialLayout }: AppShellProps) {
  return (
    <CompactModeProvider>
      <LayoutProvider initialLayout={initialLayout}>
        <SearchProvider>
          <AppShellContent>{children}</AppShellContent>
        </SearchProvider>
      </LayoutProvider>
    </CompactModeProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>("aiop-theme-mode", "dark");
  const [updateNoticeDismissed, setUpdateNoticeDismissed] = useLocalStorage<boolean>("aiop-update-notice-v1", false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<QuickAddCategory | null>(null);
  const [, startRefreshTransition] = useTransition();
  const { isCompact } = useCompactMode();
  const isMobile = useIsMobile();
  const showBottomNav = isCompact || isMobile;
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
    setUpdateNoticeDismissed(true);
  }

  async function handleAddedItem<T extends OptimisticCategory>(
    category: T,
    item: OptimisticPayloadMap[T],
    action: () => Promise<unknown>,
  ) {
    setActiveCategory(null);
    dispatchDashboardOptimisticEvent({ type: "apply", category, item });
    try {
      await action();
      startRefreshTransition(() => {
        router.refresh();
      });
    } catch (error) {
      dispatchDashboardOptimisticEvent({ type: "rollback", category, id: item.id });
      console.error("Failed to save quick add item", error);
    }
  }

  async function handleAddedRetro(input: QuickRetroInput) {
    const today = getLocalDateString(new Date());
    const todo = input.addToTodo ? createTodoFromTry(input.text) : null;
    const retroItem: RetroItem = {
      id: createId(),
      text: input.text,
      done: input.section === "try" ? false : undefined,
      linkedTodoId: todo?.id,
    };

    setActiveCategory(null);
    await addRetroItem(today, input.section, retroItem, todo ?? undefined);
    startRefreshTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${showBottomNav ? "" : "md:flex"} ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {showBottomNav ? null : <Sidebar />}
      <div className="min-w-0 flex-1">
        <Header
          isDarkMode={isDarkMode}
          isMobileLayout={showBottomNav}
          onToggleTheme={handleToggleTheme}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />
        <main
          className={`thin-scrollbar min-h-0 ${
            showBottomNav
              ? "mx-auto max-w-md px-3 py-4 pb-24 md:h-[calc(100vh-88px)] md:overflow-y-auto"
              : "px-5 py-6 md:h-[calc(100vh-88px)] md:overflow-y-auto md:px-8"
          }`}
        >
          <div className={showBottomNav ? "space-y-4" : undefined}>{children}</div>
        </main>
      </div>
      {showBottomNav ? <BottomTabBar /> : null}
      <UpdateNoticeModal isOpen={!updateNoticeDismissed} onClose={handleCloseUpdateNotice} />
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSelectCategory={handleSelectQuickAddCategory} />
      <AddWantModal
        isOpen={activeCategory === "want"}
        onClose={handleCloseItemModal}
        onAdd={(item: WantItem) => handleAddedItem("want", item, () => createWant(item))}
      />
      <AddSubscriptionModal
        isOpen={activeCategory === "subscription"}
        onClose={handleCloseItemModal}
        onAdd={(item: Subscription) => handleAddedItem("subscription", item, () => createSubscription(item))}
      />
      <AddInsightModal
        isOpen={activeCategory === "insight"}
        onClose={handleCloseItemModal}
        onAdd={(item: Insight) => handleAddedItem("insight", item, () => createInsight(item))}
      />
      <AddRegretItemModal
        isOpen={activeCategory === "regret"}
        onClose={handleCloseItemModal}
        onAdd={async (item: RegretItem) => {
          setActiveCategory(null);
          await createRegretItem(item);
          startRefreshTransition(() => {
            router.refresh();
          });
        }}
      />
      <AddNoteModal
        isOpen={activeCategory === "note"}
        onClose={handleCloseItemModal}
        onAdd={(item: Note) => handleAddedItem("note", item, () => createNote(item))}
      />
      <AddTodoModal
        isOpen={activeCategory === "todo"}
        onClose={handleCloseItemModal}
        onAdd={(item: TodoItem) => handleAddedItem("todo", item, () => createTodo(item))}
      />
      <AddRetroModal
        isOpen={activeCategory === "retro"}
        onClose={handleCloseItemModal}
        onAdd={handleAddedRetro}
      />
    </div>
  );
}
