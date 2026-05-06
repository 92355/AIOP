"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AssetSnapshot } from "@/components/dashboard/AssetSnapshot";
import { RecentInsights } from "@/components/dashboard/RecentInsights";
import { SubscriptionSummary } from "@/components/dashboard/SubscriptionSummary";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { WantPreview } from "@/components/dashboard/WantPreview";
import { AssetCalculatorView } from "@/components/calculator/AssetCalculatorView";
import { BookInsightsView } from "@/components/insights/BookInsightsView";
import { NotesInboxView } from "@/components/notes/NotesInboxView";
import { RegretTrackerView } from "@/components/regret/RegretTrackerView";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { WantsView } from "@/components/wants/WantsView";
import type { ViewKey } from "@/types";

export default function Home() {
  const [selectedView, setSelectedView] = useState<ViewKey>("dashboard");

  return (
    <AppShell selectedView={selectedView} onSelectView={setSelectedView}>
      {selectedView === "dashboard" && <DashboardView />}
      {selectedView === "wants" && <WantsView />}
      {selectedView === "calculator" && <AssetCalculatorView />}
      {selectedView === "regret" && <RegretTrackerView />}
      {selectedView === "subscriptions" && <SubscriptionsView />}
      {selectedView === "insights" && <BookInsightsView />}
      {selectedView === "notes" && <NotesInboxView />}
    </AppShell>
  );
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">AIOP</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold text-zinc-50">내 삶의 컨트롤 센터</h2>
            <p className="mt-3 max-w-2xl text-zinc-400">
              내가 필요한 모든 것을 하나의 페이지에서 관리한다.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            오늘은 구매 판단 2개와 구독 리뷰 1개를 보면 충분합니다.
          </div>
        </div>
      </section>
      <SummaryCards />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WantPreview />
        <AssetSnapshot />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SubscriptionSummary />
        <RecentInsights />
      </div>
    </div>
  );
}
