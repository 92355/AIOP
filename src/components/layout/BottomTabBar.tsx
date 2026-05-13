"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, navItems } from "@/components/layout/navItems";
import type { ViewKey } from "@/types";

const shortLabels: Record<ViewKey, string> = {
  dashboard: "홈",
  wants: "구매",
  calculator: "계산",
  regret: "후회",
  subscriptions: "구독",
  insights: "인사이트",
  notes: "노트",
  todos: "Todo",
  retros: "회고",
};

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 backdrop-blur"
      aria-label="하단 탐색"
    >
      <div className="mx-auto grid max-w-md grid-cols-9">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item);

          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-medium transition ${
                active
                  ? "text-emerald-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-xl transition ${active ? "bg-emerald-400/15" : ""}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="max-w-full truncate leading-none">{shortLabels[item.key]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
