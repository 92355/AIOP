"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import type { ViewKey } from "@/types";

const titles: Record<ViewKey, string> = {
  dashboard: "Welcome back",
  wants: "Wants",
  calculator: "Asset Calculator",
  regret: "Regret Tracker",
  subscriptions: "Subscriptions",
  insights: "Book Insights",
  notes: "Notes / Inbox",
};

type AppShellProps = {
  selectedView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  children: React.ReactNode;
};

export function AppShell({ selectedView, onSelectView, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 md:flex">
      <Sidebar selectedView={selectedView} onSelectView={onSelectView} />
      <div className="min-w-0 flex-1">
        <Header title={titles[selectedView]} />
        <main className="thin-scrollbar h-[calc(100vh-88px)] overflow-y-auto px-5 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
