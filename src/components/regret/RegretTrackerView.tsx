import { regrets } from "@/data/mockData";
import { formatKRW } from "@/lib/formatters";

export function RegretTrackerView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-zinc-50">그때 살걸 기록장</h2>
        <p className="mt-2 text-zinc-500">관심 있었던 자산과 물건을 결과가 아니라 판단 과정으로 복기합니다.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {regrets.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-zinc-50">{item.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{item.memo}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${item.changeRate >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-zinc-800 text-zinc-300"}`}>
                {item.changeRate > 0 ? "+" : ""}{item.changeRate}%
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-950/70 p-4">
                <p className="text-sm text-zinc-500">당시 가격</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{formatKRW(item.oldPrice)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-950/70 p-4">
                <p className="text-sm text-zinc-500">현재 가격</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{formatKRW(item.currentPrice)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <p className="rounded-2xl border border-zinc-800 p-4 text-sm leading-6 text-zinc-400">당시 생각: {item.thoughtThen}</p>
              <p className="rounded-2xl border border-zinc-800 p-4 text-sm leading-6 text-zinc-400">현재 결과: {item.resultNow}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
