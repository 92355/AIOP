"use client";

import Link from "next/link";
import { Command, Moon, Plus, Search, Smartphone, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useSearchContext } from "@/contexts/SearchContext";
import { SearchResultsDropdown } from "@/components/layout/SearchResultsDropdown";
import { HeaderSettingsButton } from "@/components/layout/settings/HeaderSettingsButton";
import { ProfileBadge } from "@/components/layout/ProfileBadge";
import { getActiveNavItem, isDashboardPathname, viewTitles } from "@/components/layout/navItems";

type HeaderProps = {
  isDarkMode: boolean;
  isMobileLayout: boolean;
  onToggleTheme: () => void;
  onOpenQuickAdd: () => void;
};

export function Header({ isDarkMode, isMobileLayout, onToggleTheme, onOpenQuickAdd }: HeaderProps) {
  const pathname = usePathname();
  const { isCompact, toggleCompact } = useCompactMode();
  const { searchQuery, setSearchQuery } = useSearchContext();
  const activeNavItem = getActiveNavItem(pathname);
  const canCustomizeLayout = isDashboardPathname(pathname);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const title = viewTitles[activeNavItem.key];
  const today = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(new Date());
  const headerLayoutClass = isMobileLayout ? "px-3 py-2.5" : "flex items-center justify-end px-5 py-4 md:px-8";
  const controlsLayoutClass = isMobileLayout ? "flex w-full flex-col items-stretch gap-3" : "flex flex-col items-end gap-3 sm:flex-row sm:items-center";
  const headerInnerClass = isMobileLayout ? "mx-auto w-full max-w-md" : "";
  const searchPlaceholder = isMobileLayout ? "검색..." : "구매 목표, 노트, 인사이트 검색...";
  const searchBoxClass = isMobileLayout
    ? "flex h-10 min-w-0 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 text-zinc-500"
    : "flex h-11 min-w-0 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 text-zinc-500";
  const iconButtonClass = isMobileLayout
    ? "flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50"
    : "flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50";
  const compactToggleClass = isCompact
    ? "flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:text-zinc-50"
    : "flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50";
  const quickAddClass = isMobileLayout
    ? "flex h-10 items-center gap-2 rounded-2xl bg-emerald-400 px-3.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
    : "flex h-11 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300";
  const normalizedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    if (!canCustomizeLayout) {
      setIsSearchDropdownOpen(false);
      return;
    }

    setIsSearchDropdownOpen(normalizedSearchQuery.length > 0);
  }, [canCustomizeLayout, normalizedSearchQuery]);

  return (
    <header className={`relative z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur ${headerLayoutClass}`}>
      <div className={`${headerInnerClass} flex flex-col gap-4`}>
        {isMobileLayout ? (
          <Link href="/" className="rounded-2xl px-1 py-0.5 transition hover:bg-zinc-900" aria-label="대시보드로 이동">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">AIOP</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-50">{title}</h2>
          </Link>
        ) : null}
<div className={controlsLayoutClass}>
          <div className={`${isCompact ? "w-full" : "sm:w-80"} relative min-w-0`}>
            <div className={searchBoxClass}>
              <Search className="h-4 w-4" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                onFocus={() => {
                  if (!canCustomizeLayout) return;
                  if (eventHasSearchValue(searchQuery)) {
                    setIsSearchDropdownOpen(true);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                placeholder={searchPlaceholder}
                aria-label="검색"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchDropdownOpen(false);
                  }}
                  aria-label="검색어 지우기"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Command className="h-4 w-4" />
              )}
            </div>
            <SearchResultsDropdown
              isOpen={canCustomizeLayout && isSearchDropdownOpen}
              query={searchQuery}
              onClose={() => setIsSearchDropdownOpen(false)}
            />
          </div>
          <div className="flex w-full items-center justify-end gap-1.5 sm:gap-2 sm:w-auto">
            <div className="hidden text-right text-xs text-zinc-500 lg:block">{today}</div>
            {canCustomizeLayout ? <HeaderSettingsButton /> : null}
            <button
              aria-label={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
              aria-pressed={!isDarkMode}
              className={iconButtonClass}
              title={isDarkMode ? "라이트 모드" : "다크 모드"}
              type="button"
              onClick={onToggleTheme}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {!isMobileLayout || isCompact ? (
              <button
                className={compactToggleClass}
                type="button"
                title={isCompact ? "일반뷰" : "간단뷰"}
                aria-label={isCompact ? "일반뷰로 변경" : "간단뷰로 변경"}
                aria-pressed={isCompact}
                onClick={toggleCompact}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            ) : null}
            <button
              className={quickAddClass}
              type="button"
              onClick={onOpenQuickAdd}
            >
              <Plus className="h-4 w-4" />
              빠른 추가
            </button>
            <ProfileBadge />
          </div>
        </div>
      </div>
    </header>
  );
}

function eventHasSearchValue(value: string) {
  return value.trim().length > 0;
}
