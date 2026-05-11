"use client";

import { navItems } from "@/components/layout/navItems";
import type { ViewKey } from "@/types";

type BottomTabBarProps = {
  selectedView: ViewKey;
  onSelectView: (view: ViewKey) => void;
};

export function BottomTabBar({ selectedView, onSelectView }: BottomTabBarProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur"
      aria-label="간단뷰 하단 탐색"
    >
      <div className="mx-auto grid max-w-md grid-cols-7 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = selectedView === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectView(item.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-medium transition ${
                active
                  ? "bg-emerald-400/10 text-emerald-300 shadow-soft"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
