"use client";

import { useEffect } from "react";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CompactModeProvider, useCompactMode } from "@/contexts/CompactModeContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { viewTitles } from "@/components/layout/navItems";
import type { ViewKey } from "@/types";

type AppShellProps = {
  selectedView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  onOpenQuickAdd: () => void;
  children: React.ReactNode;
};

type ThemeMode = "dark" | "light";

export function AppShell({ selectedView, onSelectView, onOpenQuickAdd, children }: AppShellProps) {
  return (
    <CompactModeProvider>
      <LayoutProvider>
        <AppShellContent selectedView={selectedView} onSelectView={onSelectView} onOpenQuickAdd={onOpenQuickAdd}>
          {children}
        </AppShellContent>
      </LayoutProvider>
    </CompactModeProvider>
  );
}

function AppShellContent({ selectedView, onSelectView, onOpenQuickAdd, children }: AppShellProps) {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>("aiop-theme-mode", "dark");
  const { isCompact } = useCompactMode();
  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((currentThemeMode) => (currentThemeMode === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${isCompact ? "" : "md:flex"} ${isDarkMode ? "theme-dark" : "theme-light"}`}>
      {isCompact ? null : <Sidebar selectedView={selectedView} onSelectView={onSelectView} />}
      <div className="min-w-0 flex-1">
        <Header
          title={viewTitles[selectedView]}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onOpenQuickAdd={onOpenQuickAdd}
          canCustomizeLayout={selectedView === "dashboard"}
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
      {isCompact ? <BottomTabBar selectedView={selectedView} onSelectView={onSelectView} /> : null}
    </div>
  );
}
