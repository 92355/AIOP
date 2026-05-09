"use client";

import { Bell, Command, Plus, Search } from "lucide-react";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  const today = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">운영 센터</p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-50">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 min-w-0 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 text-zinc-500 sm:w-80">
          <Search className="h-4 w-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            placeholder="구매 목표, 노트, 인사이트 검색..."
          />
          <Command className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs text-zinc-500 lg:block">{today}</div>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50" type="button" title="알림">
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-11 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300" type="button">
            <Plus className="h-4 w-4" />
            빠른 추가
          </button>
        </div>
      </div>
    </header>
  );
}
