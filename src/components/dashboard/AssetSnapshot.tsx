"use client";

import { Target } from "lucide-react";
import { wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateRequiredCapital } from "@/lib/calculations";
import { formatKRW } from "@/lib/formatters";
import type { WantItem } from "@/types";

function getStoredWants(value: unknown): WantItem[] {
  return Array.isArray(value) ? (value as WantItem[]) : wants;
}

export function AssetSnapshot() {
  const [storedWants] = useLocalStorage<unknown>("aiop:wants", wants);
  const items = getStoredWants(storedWants);
  const targetItem = items[0];
  const expectedYield = targetItem?.expectedYield ?? 0;
  const requiredCapital = targetItem ? calculateRequiredCapital(targetItem.price, expectedYield) : 0;

  return (
    <section className="rounded-2xl border border-emerald-400/20 bg-zinc-900 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Asset Purchase Snapshot</h3>
          <p className="mt-1 text-sm text-zinc-500">Latest want converted into required capital.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Target className="h-5 w-5" />
        </div>
      </div>
      {targetItem ? (
        <>
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-sm text-zinc-500">Target item</p>
            <h4 className="mt-1 text-2xl font-semibold text-zinc-50">{targetItem.name}</h4>
            <p className="mt-1 text-zinc-400">{formatKRW(targetItem.price)}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-sm text-zinc-500">Expected yield</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{expectedYield}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-sm text-zinc-500">Required capital</p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">{formatKRW(requiredCapital)}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-sm text-zinc-500">Decision note</p>
            <p className="mt-1 font-medium text-zinc-100">Review this latest purchase goal against your asset yield.</p>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
          No purchase target is being tracked yet.
        </div>
      )}
    </section>
  );
}
