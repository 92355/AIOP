"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { addDays, buildWeeklyRollup, formatDateLabel, getLocalDateString, getWeekRange, parseLocalDate } from "@/lib/retros";
import { normalizeRetros } from "@/lib/storageNormalizers";
import { getRetros } from "@/app/retros/actions";
import type { KptRetro } from "@/types";

export function WeeklyRollupView() {
  const { isCompact } = useCompactMode();
  const [storedRetros, setStoredRetros] = useState<KptRetro[]>([]);
  const [weekAnchor, setWeekAnchor] = useState(() => getLocalDateString(new Date()));

  useEffect(() => {
    getRetros().then(setStoredRetros).catch(console.error);
  }, []);

  const retros = normalizeRetros(storedRetros);
  const weekRange = getWeekRange(parseLocalDate(weekAnchor));
  const rollup = buildWeeklyRollup(retros, weekRange.start);
  const completionPercent = Math.round(rollup.completionRate * 100);

  function moveWeek(days: number) {
    setWeekAnchor(getLocalDateString(addDays(weekRange.start, days)));
  }

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <div className={`flex gap-3 ${isCompact ? "flex-col" : "items-start justify-between"}`}>
          <div>
            <Link href="/retros" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200">
              <ArrowLeft className="h-4 w-4" />
              K.P.T로 돌아가기
            </Link>
            <h2 className={`mt-3 font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>주간 회고</h2>
            <p className="mt-2 text-zinc-500">
              {formatDateLabel(rollup.weekStart)} - {formatDateLabel(rollup.weekEnd)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveWeek(-7)}
              className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 px-3 text-sm text-zinc-300 hover:text-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              이전 주
            </button>
            <button
              type="button"
              onClick={() => moveWeek(7)}
              className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 px-3 text-sm text-zinc-300 hover:text-zinc-50"
            >
              다음 주
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "grid-cols-4"}`}>
          <SummaryBox label="작성 일수" value={`${rollup.daysWritten} / 7`} />
          <SummaryBox label="총 Try" value={`${rollup.totalTry}개`} />
          <SummaryBox label="완료 Try" value={`${rollup.doneTry}개`} />
          <SummaryBox label="완료율" value={`${completionPercent}%`} />
        </div>
      </section>

      <section className={`grid gap-5 ${isCompact ? "" : "xl:grid-cols-[0.75fr_1.25fr]"}`}>
        <article className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
          <h3 className="text-xl font-semibold text-zinc-50">Problem TOP 3</h3>
          <div className="mt-4 space-y-2">
            {rollup.problemKeywords.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">아직 Problem 키워드가 없습니다.</div>
            ) : null}
            {rollup.problemKeywords.map((keyword, index) => (
              <div key={keyword.word} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                <span className="text-sm text-zinc-200">
                  {index + 1}. {keyword.word}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{keyword.count}회</span>
              </div>
            ))}
          </div>
        </article>

        <article className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
          <h3 className="text-xl font-semibold text-zinc-50">일별 회고</h3>
          <div className="mt-4 space-y-3">
            {rollup.daily.map((day) => {
              const retro = day.retro;
              const doneTryCount = retro?.try.filter((item) => item.done).length ?? 0;

              return (
                <div key={day.date} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                        <h4 className="font-medium text-zinc-100">
                          {day.date} · {day.weekday}
                        </h4>
                      </div>
                      {retro ? (
                        <p className="mt-2 text-sm text-zinc-500">
                          K {retro.keep.length} / P {retro.problem.length} / T {retro.try.length} ({doneTryCount} 완료)
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-500">작성 전</p>
                      )}
                    </div>
                    <Link
                      href={`/retros?date=${day.date}`}
                      className="shrink-0 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:border-emerald-400/40 hover:text-emerald-300"
                    >
                      상세 보기
                    </Link>
                  </div>

                  {retro ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <PreviewColumn title="K" items={retro.keep} />
                      <PreviewColumn title="P" items={retro.problem} />
                      <PreviewColumn title="T" items={retro.try} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-50">{value}</p>
    </div>
  );
}

function PreviewColumn({ title, items }: { title: string; items: Array<{ text: string }> }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
      <p className="text-xs font-medium text-zinc-500">{title}</p>
      <div className="mt-2 space-y-1">
        {items.slice(0, 3).map((item, index) => (
          <p key={`${item.text}-${index}`} className="truncate text-sm text-zinc-300">
            {item.text}
          </p>
        ))}
        {items.length === 0 ? <p className="text-sm text-zinc-600">없음</p> : null}
      </div>
    </div>
  );
}
