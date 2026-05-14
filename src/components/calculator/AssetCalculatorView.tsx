"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, TrendingUp } from "lucide-react";
import { ExchangeRatePanel } from "@/components/calculator/ExchangeRatePanel";
import { MoneyInputField } from "@/components/inputs/MoneyInputField";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { calculateAssetPlan } from "@/lib/calculations";
import { formatKRW } from "@/lib/formatters";

const CAREFUL_REQUIRED_CAPITAL = 100000000;
const WANT_DRAFT_STORAGE_KEY = "aiop-want-draft-from-calculator";

export function AssetCalculatorView() {
  const router = useRouter();
  const { isCompact } = useCompactMode();
  const isMobile = useIsMobile();
  const isCompactLayout = isCompact || isMobile;
  const [price, setPrice] = useState(3500000);
  const [targetMonths, setTargetMonths] = useState(12);
  const [expectedYield, setExpectedYield] = useState(4);
  const [monthlyInvestment, setMonthlyInvestment] = useState(300000);

  const result = useMemo(
    () => calculateAssetPlan(price, targetMonths, expectedYield, monthlyInvestment),
    [price, targetMonths, expectedYield, monthlyInvestment],
  );

  const decision = getPurchaseDecision(price, monthlyInvestment, result.requiredCapital, result.monthsToBuy);

  function handleAddToWants() {
    const draft = {
      name: "",
      price,
      currency: "KRW" as const,
      category: "Productivity" as const,
      reason: `계산기 판단: ${decision}`,
      priority: "medium" as const,
      status: "thinking" as const,
      targetMonths,
      expectedYield,
    };

    localStorage.setItem(WANT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    router.push("/wants?source=calculator");
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
      <div className={`min-w-0 max-w-full grid gap-4 ${isCompactLayout ? "" : "xl:grid-cols-[1.05fr_0.95fr] xl:gap-6"}`}>
      <section className={`min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-emerald-400/20 bg-zinc-900 shadow-soft ${isCompactLayout ? "p-4" : "p-6"}`}>
        <div className={`flex gap-3 ${isCompactLayout ? "items-center justify-center text-center" : "items-center"}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className={`font-semibold text-zinc-50 ${isCompactLayout ? "text-2xl" : "text-3xl"}`}>자산 구매 계산기</h2>
            {isCompactLayout ? null : <p className="mt-1 text-zinc-500">소비를 자산 현금흐름 기준으로 다시 계산합니다.</p>}
          </div>
        </div>
        <div className={`grid gap-4 ${isCompactLayout ? "mt-5" : "mt-8 sm:grid-cols-2"}`}>
          <MoneyInputField label="구매 가격" value={price} onChange={setPrice} compact={isCompactLayout} />
          <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">목표 기간</span>
            <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden">
              <input
                type="number"
                value={targetMonths}
                onChange={(event) => setTargetMonths(toSafeNumber(event.target.value))}
                className="w-0 min-w-0 flex-1 bg-transparent text-xl font-semibold text-zinc-50 outline-none sm:text-2xl"
              />
              <span className="text-sm text-zinc-500">개월</span>
            </div>
          </label>
          <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">예상 수익률</span>
            <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden">
              <input
                type="number"
                value={expectedYield}
                onChange={(event) => setExpectedYield(toSafeNumber(event.target.value))}
                className="w-0 min-w-0 flex-1 bg-transparent text-xl font-semibold text-zinc-50 outline-none sm:text-2xl"
              />
              <span className="text-sm text-zinc-500">%</span>
            </div>
          </label>
          <MoneyInputField label="월 투자 가능액" value={monthlyInvestment} onChange={setMonthlyInvestment} compact={isCompactLayout} />
        </div>
      </section>

      <section className={`min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompactLayout ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-emerald-300">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-50">판단 결과</h3>
            {isCompactLayout ? null : <p className="text-sm text-zinc-500">입력값에 따라 즉시 갱신됩니다.</p>}
          </div>
        </div>
        <div className={isCompactLayout ? "mt-5 space-y-3" : "mt-8 space-y-4"}>
          <ResultRow label="필요 자산" value={formatKRW(result.requiredCapital)} highlight compact={isCompactLayout} />
          <ResultRow label="월 필요 현금흐름" value={formatKRW(result.monthlyCashflowNeeded)} compact={isCompactLayout} />
          <ResultRow label="구매까지 걸리는 기간" value={result.monthsToBuy > 0 ? `${result.monthsToBuy.toFixed(1)}개월` : "계산 대기"} compact={isCompactLayout} />
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-300/80">구매 판단</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-200">{decision}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToWants}
            className="flex h-11 w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            구매목표에 추가
          </button>
        </div>
      </section>
      </div>

      <ExchangeRatePanel compact={isCompactLayout} />
    </div>
  );
}

function ResultRow({ label, value, highlight = false, compact = false }: { label: string; value: string; highlight?: boolean; compact?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${compact ? "p-3" : "p-5"}`}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`break-words font-semibold ${compact ? "text-base" : "text-xl"} ${highlight ? "text-emerald-300" : "text-zinc-50"}`}>{value}</p>
    </div>
  );
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function getPurchaseDecision(price: number, monthlyInvestment: number, requiredCapital: number, monthsToBuy: number) {
  if (monthlyInvestment <= 0 || price <= 0) return "입력값이 더 필요합니다";
  if (requiredCapital >= CAREFUL_REQUIRED_CAPITAL) return "신중한 계획이 필요합니다";
  if (monthsToBuy <= 3) return "곧 구매 가능합니다";
  if (monthsToBuy <= 12) return "목표로 설정하세요";
  return "보류";
}
