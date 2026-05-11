"use client";

import { Target } from "lucide-react";
import { wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { calculateRequiredCapital } from "@/lib/calculations";
import { formatKRW } from "@/lib/formatters";
import type { WantItem } from "@/types";

function getStoredWants(value: unknown): WantItem[] {
  return Array.isArray(value) ? (value as WantItem[]) : wants;
}

export function AssetSnapshot() {
  const { isCompact } = useCompactMode();
  const [storedWants] = useLocalStorage<unknown>("aiop:wants", wants);
  const items = getStoredWants(storedWants);
  const targetItem = items[0];
  const expectedYield = targetItem?.expectedYield ?? 0;
  const requiredCapital = targetItem ? calculateRequiredCapital(targetItem.price, expectedYield) : 0;

  return (
    <section className={`rounded-2xl border border-emerald-400/20 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">자산 기준 구매 판단</h3>
          {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">최근 구매 목표를 필요 자본 기준으로 환산합니다.</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Target className="h-5 w-5" />
        </div>
      </div>
      {targetItem ? (
        <>
          <div className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${isCompact ? "mt-4 p-3" : "mt-6 p-4"}`}>
            <p className="text-sm text-zinc-500">목표 항목</p>
            <h4 className={`mt-1 truncate font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>{targetItem.name}</h4>
            <p className="mt-1 text-zinc-400">{formatKRW(targetItem.price)}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-sm text-zinc-500">예상 수익률</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{expectedYield}%</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-sm text-zinc-500">필요 자본</p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">{formatKRW(requiredCapital)}</p>
            </div>
          </div>
          {isCompact ? null : <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-sm text-zinc-500">판단 메모</p>
            <p className="mt-1 font-medium text-zinc-100">이 구매 목표가 자산 수익률 기준으로 감당 가능한지 확인하세요.</p>
          </div>}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
          아직 추적 중인 구매 목표가 없습니다.
        </div>
      )}
    </section>
  );
}
