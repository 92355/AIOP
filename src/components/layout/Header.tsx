"use client";

import { Command, Moon, Plus, Search, Smartphone, Sun } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";

type HeaderProps = {
  title: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenQuickAdd: () => void;
};

export function Header({ title, isDarkMode, onToggleTheme, onOpenQuickAdd }: HeaderProps) {
  const { isCompact, toggleCompact } = useCompactMode();
  const today = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <header className={`flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur md:flex-row md:items-center md:justify-between ${isCompact ? "px-3 py-3" : "px-5 py-4 md:px-8"}`}>
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">운영 센터</p>
        <h2 className={`mt-1 font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>{title}</h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`${isCompact ? "hidden" : "flex"} h-11 min-w-0 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 text-zinc-500 sm:w-80`}>
          <Search className="h-4 w-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            placeholder="구매 목표, 노트, 인사이트 검색..."
          />
          <Command className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs text-zinc-500 lg:block">{today}</div>
          <button
            aria-label={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
            aria-pressed={!isDarkMode}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50"
            title={isDarkMode ? "라이트 모드" : "다크 모드"}
            type="button"
            onClick={onToggleTheme}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-zinc-300 hover:text-zinc-50 ${
              isCompact ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-zinc-800 bg-zinc-900"
            }`}
            type="button"
            title={isCompact ? "일반뷰" : "간단뷰"}
            aria-label={isCompact ? "일반뷰로 변경" : "간단뷰로 변경"}
            aria-pressed={isCompact}
            onClick={toggleCompact}
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            className="flex h-11 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            type="button"
            onClick={onOpenQuickAdd}
          >
            <Plus className="h-4 w-4" />
            빠른 추가
          </button>
        </div>
      </div>
    </header>
  );
}
