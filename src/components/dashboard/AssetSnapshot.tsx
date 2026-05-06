import { Target } from "lucide-react";
import { formatKRW } from "@/lib/calculations";

export function AssetSnapshot() {
  return (
    <section className="rounded-2xl border border-emerald-400/20 bg-zinc-900 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Asset Purchase Snapshot</h3>
          <p className="mt-1 text-sm text-zinc-500">이 물건을 자산수익으로 사려면?</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <Target className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="text-sm text-zinc-500">Target Item</p>
        <h4 className="mt-1 text-2xl font-semibold text-zinc-50">맥북 프로</h4>
        <p className="mt-1 text-zinc-400">{formatKRW(3500000)}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-sm text-zinc-500">예상 배당률</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">4%</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-sm text-zinc-500">필요 자산</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{formatKRW(87500000)}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <p className="text-sm text-zinc-500">구매 판단</p>
        <p className="mt-1 font-medium text-zinc-100">보류 / 목표화 추천</p>
      </div>
    </section>
  );
}
