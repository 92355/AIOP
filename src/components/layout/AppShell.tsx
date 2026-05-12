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
import { AddRetroModal, type QuickRetroInput } from "@/components/retros/AddRetroModal";
import { AddSubscriptionModal } from "@/components/subscriptions/AddSubscriptionModal";
import { AddTodoModal } from "@/components/todos/AddTodoModal";
import { defaultTodos } from "@/components/todos/TodoView";
import { AddWantModal } from "@/components/wants/AddWantModal";
import { CompactModeProvider, useCompactMode } from "@/contexts/CompactModeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { insights, notes, regrets, subscriptions, wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createEmptyRetro, createId, createTodoFromTry, getLocalDateString, sortRetrosByDateDesc } from "@/lib/retros";
import { prependLocalStorageItem } from "@/lib/storage";
import { normalizeRetros } from "@/lib/storageNormalizers";
import type { Insight, KptRetro, Note, RegretItem, RetroItem, Subscription, TodoItem, WantItem } from "@/types";

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
  todos: "aiop:todos",
  retros: "aiop:retros",
} as const;

const categoryRoutes: Record<QuickAddCategory, string> = {
  want: "/wants",
  subscription: "/subscriptions",
  insight: "/insights",
  regret: "/regret",
  note: "/notes",
  todo: "/todos",
  retro: "/retros",
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

  function handleAddedTodo(item: TodoItem) {
    handleAddedItem<TodoItem>(categoryRoutes.todo, storageKeys.todos, item, defaultTodos);
  }

  function handleAddedRetro(input: QuickRetroInput) {
    const today = getLocalDateString(new Date());
    const todo = input.addToTodo ? createTodoFromTry(input.text) : null;
    const retroItem: RetroItem = {
      id: createId(),
      text: input.text,
      done: input.section === "try" ? false : undefined,
      linkedTodoId: todo?.id,
    };
    const retros = readLocalStorageArray<KptRetro>(storageKeys.retros);
    const nextRetros = upsertTodayRetro(retros, today, input.section, retroItem);

    writeLocalStorageValue(storageKeys.retros, nextRetros);

    if (todo) {
      const todos = readLocalStorageArray<TodoItem>(storageKeys.todos, defaultTodos);
      writeLocalStorageValue(storageKeys.todos, [todo, ...todos]);
    }

    setActiveCategory(null);

    if (pathname === categoryRoutes.retro) {
      router.refresh();
      return;
    }

    router.push(categoryRoutes.retro);
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
      <AddTodoModal
        isOpen={activeCategory === "todo"}
        onClose={handleCloseItemModal}
        onAdd={handleAddedTodo}
      />
      <AddRetroModal
        isOpen={activeCategory === "retro"}
        onClose={handleCloseItemModal}
        onAdd={handleAddedRetro}
      />
    </div>
  );
}

function readLocalStorageArray<T>(key: string, fallbackItems: T[] = []): T[] {
  if (typeof window === "undefined") return fallbackItems;

  try {
    const storedValue = window.localStorage.getItem(key);
    const parsedValue = storedValue ? (JSON.parse(storedValue) as unknown) : null;
    return Array.isArray(parsedValue) ? (parsedValue as T[]) : fallbackItems;
  } catch (error) {
    console.warn(`Failed to parse localStorage key: ${key}`, error);
    return fallbackItems;
  }
}

function writeLocalStorageValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("aiop:local-storage-change", { detail: { key, value } }));
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error);
  }
}

function upsertTodayRetro(retros: KptRetro[], today: string, section: QuickRetroInput["section"], item: RetroItem): KptRetro[] {
  const now = new Date().toISOString();
  const safeRetros = normalizeRetros(retros);
  const existingRetro = safeRetros.find((retro) => retro.date === today);

  if (!existingRetro) {
    return [
      {
        ...createEmptyRetro(today),
        [section]: [item],
        createdAt: now,
        updatedAt: now,
      },
      ...safeRetros,
    ].sort(sortRetrosByDateDesc);
  }

  return safeRetros
    .map((retro) =>
      retro.date === today
        ? {
            ...retro,
            [section]: [...retro[section], item],
            updatedAt: now,
          }
        : retro,
    )
    .sort(sortRetrosByDateDesc);
}
