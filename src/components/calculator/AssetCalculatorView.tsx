"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { calculateAssetPlan, formatKRW } from "@/lib/calculations";

export function AssetCalculatorView() {
  const [price, setPrice] = useState(3500000);
  const [targetMonths, setTargetMonths] = useState(12);
  const [expectedYield, setExpectedYield] = useState(4);
  const [monthlyInvestment, setMonthlyInvestment] = useState(300000);

  const result = useMemo(
    () => calculateAssetPlan(price, targetMonths, expectedYield, monthlyInvestment),
    [price, targetMonths, expectedYield, monthlyInvestment],
  );

  const decision = result.monthsToBuy <= targetMonths ? "목표 기간 내 구매 가능" : "보류 / 목표화 추천";

  const fields = [
    { label: "Item Price", value: price, setter: setPrice, suffix: "KRW" },
    { label: "Target Months", value: targetMonths, setter: setTargetMonths, suffix: "months" },
    { label: "Expected Yield %", value: expectedYield, setter: setExpectedYield, suffix: "%" },
    { label: "Monthly Investment", value: monthlyInvestment, setter: setMonthlyInvestment, suffix: "KRW" },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-2xl border border-emerald-400/20 bg-zinc-900 p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-zinc-50">Asset Purchase Calculator</h2>
            <p className="mt-1 text-zinc-500">소비를 자산 현금흐름 기준으로 다시 계산합니다.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <span className="text-sm text-zinc-500">{field.label}</span>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  value={field.value}
                  onChange={(event) => field.setter(Number(event.target.value))}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-zinc-50 outline-none"
                />
                <span className="text-sm text-zinc-500">{field.suffix}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-emerald-300">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-50">Decision Output</h3>
            <p className="text-sm text-zinc-500">입력값에 따라 즉시 갱신됩니다.</p>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <ResultRow label="Required Capital" value={formatKRW(result.requiredCapital)} highlight />
          <ResultRow label="Monthly Cashflow Needed" value={formatKRW(result.monthlyCashflowNeeded)} />
          <ResultRow label="Months to Buy" value={`${result.monthsToBuy.toFixed(1)}개월`} />
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-300/80">Purchase Decision</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-200">{decision}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-xl font-semibold ${highlight ? "text-emerald-300" : "text-zinc-50"}`}>{value}</p>
    </div>
  );
}
