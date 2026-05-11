import { Trash2 } from "lucide-react";
import type { Insight } from "@/types";
import { getInsightTypeLabel } from "@/lib/labels";

type InsightCardProps = {
  item: Insight;
  onDelete?: (id: string) => void;
};

export function InsightCard({ item, onDelete }: InsightCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{getInsightTypeLabel(item.sourceType)}</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-50">{item.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{item.relatedGoal}</span>
          {onDelete ? (
            <button
              aria-label={`${item.title} 삭제`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
              type="button"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-5 text-base leading-7 text-zinc-300">{item.keySentence}</p>
      <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-200">
        {item.actionItem}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">#{tag}</span>
        ))}
      </div>
    </article>
  );
}
