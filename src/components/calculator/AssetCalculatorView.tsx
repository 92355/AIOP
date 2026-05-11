"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { calculateAssetPlan } from "@/lib/calculations";
import { formatKRW } from "@/lib/formatters";

const CAREFUL_REQUIRED_CAPITAL = 100000000;

export function AssetCalculatorView() {
  const { isCompact } = useCompactMode();
  const [price, setPrice] = useState(3500000);
  const [targetMonths, setTargetMonths] = useState(12);
  const [expectedYield, setExpectedYield] = useState(4);
  const [monthlyInvestment, setMonthlyInvestment] = useState(300000);

  const result = useMemo(
    () => calculateAssetPlan(price, targetMonths, expectedYield, monthlyInvestment),
    [price, targetMonths, expectedYield, monthlyInvestment],
  );

  const decision = getPurchaseDecision(price, monthlyInvestment, result.requiredCapital, result.monthsToBuy);

  const fields = [
    { label: "구매 가격", value: price, setter: setPrice, suffix: "원" },
    { label: "목표 기간", value: targetMonths, setter: setTargetMonths, suffix: "개월" },
    { label: "예상 수익률", value: expectedYield, setter: setExpectedYield, suffix: "%" },
    { label: "월 투자 가능액", value: monthlyInvestment, setter: setMonthlyInvestment, suffix: "원" },
  ];

  return (
    <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-[1.05fr_0.95fr] xl:gap-6"}`}>
      <section className={`rounded-2xl border border-emerald-400/20 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>자산 구매 계산기</h2>
            {isCompact ? null : <p className="mt-1 text-zinc-500">소비를 자산 현금흐름 기준으로 다시 계산합니다.</p>}
          </div>
        </div>
        <div className={`grid gap-4 ${isCompact ? "mt-5" : "mt-8 sm:grid-cols-2"}`}>
          {fields.map((field) => (
            <label key={field.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-sm text-zinc-500">{field.label}</span>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  value={field.value}
                  onChange={(event) => field.setter(toSafeNumber(event.target.value))}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-zinc-50 outline-none"
                />
                <span className="text-sm text-zinc-500">{field.suffix}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-emerald-300">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-50">판단 결과</h3>
            {isCompact ? null : <p className="text-sm text-zinc-500">입력값에 따라 즉시 갱신됩니다.</p>}
          </div>
        </div>
        <div className={isCompact ? "mt-5 space-y-3" : "mt-8 space-y-4"}>
          <ResultRow label="필요 자산" value={formatKRW(result.requiredCapital)} highlight />
          <ResultRow label="월 필요 현금흐름" value={formatKRW(result.monthlyCashflowNeeded)} />
          <ResultRow label="구매까지 걸리는 기간" value={result.monthsToBuy > 0 ? `${result.monthsToBuy.toFixed(1)}개월` : "계산 대기"} />
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-300/80">구매 판단</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-200">{decision}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`break-words text-xl font-semibold ${highlight ? "text-emerald-300" : "text-zinc-50"}`}>{value}</p>
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
