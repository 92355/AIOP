import { insights } from "@/data/mockData";
import { InsightCard } from "@/components/insights/InsightCard";

export function BookInsightsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-zinc-50">인사이트 보관함</h2>
        <p className="mt-2 text-zinc-500">읽고 본 내용을 내 행동과 소비 판단으로 연결합니다.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {insights.map((item) => (
          <InsightCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
