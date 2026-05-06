"use client";

import {
  BarChart3,
  BookOpen,
  Calculator,
  ClipboardList,
  CreditCard,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { NavItem, ViewKey } from "@/types";

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "wants", label: "Wants", icon: Sparkles },
  { key: "calculator", label: "Asset Calculator", icon: Calculator },
  { key: "regret", label: "Regret Tracker", icon: TrendingUp },
  { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { key: "insights", label: "Book Insights", icon: BookOpen },
  { key: "notes", label: "Notes / Inbox", icon: Inbox },
];

type SidebarProps = {
  selectedView: ViewKey;
  onSelectView: (view: ViewKey) => void;
};

export function Sidebar({ selectedView, onSelectView }: SidebarProps) {
  return (
    <aside className="border-zinc-800 bg-zinc-950/95 px-4 py-5 md:h-screen md:w-72 md:border-r">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-lg font-bold text-emerald-300">
          A
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-wide text-zinc-50">AIOP</h1>
          <p className="text-xs text-zinc-500">Personal Operating Page</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto md:block md:space-y-1 md:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = selectedView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectView(item.key)}
              className={`flex min-w-fit items-center gap-3 rounded-2xl px-3 py-3 text-sm transition md:w-full ${
                active
                  ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-200 shadow-soft"
                  : "border border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 md:block">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
          <ClipboardList className="h-4 w-4 text-emerald-300" />
          Today Focus
        </div>
        <p className="text-sm leading-6 text-zinc-400">
          소비 결정, 자산 기준, 인사이트 기록을 한 화면에서 연결합니다.
        </p>
      </div>
    </aside>
  );
}
