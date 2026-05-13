"use client";

import { RefreshCw } from "lucide-react";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const sourceLabels = {
  cache: "캐시",
  network: "신규 조회",
  "stale-cache": "이전 캐시",
  identity: "동일 통화",
} as const;

export function ExchangeRatePanel({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, errorMessage, refresh, canManualRefresh, cooldownRemainingMs } = useExchangeRate("USD", "KRW");
  const rateText = data ? `1 ${data.base} = ${formatRate(data.rate)} ${data.quote}` : "환율 조회 대기";
  const sourceText = data ? sourceLabels[data.source] : "대기";
  const cooldownText = canManualRefresh ? "즉시 가능" : formatDuration(cooldownRemainingMs);
  const refreshButtonDisabled = isLoading || !canManualRefresh;

  return (
    <section className={`min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${compact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">환율 캐시</h3>
          {compact ? null : <p className="mt-1 text-sm text-zinc-500">Supabase 캐시를 먼저 확인한 뒤 필요한 경우 서버에서 환율을 갱신합니다.</p>}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshButtonDisabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-60"
          aria-label="환율 새로고침"
          title="환율 새로고침"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mt-4 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="text-sm text-zinc-500">USD/KRW</p>
        <p className={`mt-2 min-w-0 break-words font-semibold text-emerald-300 ${compact ? "text-xl" : "text-2xl"}`}>{isLoading && !data ? "불러오는 중..." : rateText}</p>
        {errorMessage ? <p className="mt-3 text-sm text-red-300">{errorMessage}</p> : null}
      </div>

      <div className={`mt-3 grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
        <MetaItem label="기준일" value={data?.rateDate ?? "-"} />
        <MetaItem label="출처" value={data?.provider ?? "frankfurter"} />
        <MetaItem label="응답" value={sourceText} />
      </div>
      <p className="mt-3 text-xs text-zinc-500">수동 새로고침 쿨다운: {cooldownText} (3시간)</p>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

function formatRate(rate: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(rate);
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
