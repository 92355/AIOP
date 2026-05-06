import { wants } from "@/data/mockData";
import { formatKRW } from "@/lib/calculations";

export function WantPreview() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Want List Preview</h3>
          <p className="text-sm text-zinc-500">구매 욕구를 점수와 자산 기준으로 정리합니다.</p>
        </div>
      </div>
      <div className="space-y-3">
        {wants.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-zinc-100">{item.name}</p>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{item.category}</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">{item.status}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">{formatKRW(item.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-zinc-50">{item.score}</p>
              <p className="text-xs text-zinc-500">AI score</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
