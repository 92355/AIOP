"use client";

import { useCompactMode } from "@/contexts/CompactModeContext";

export function HeroWidget() {
  const { isCompact } = useCompactMode();

  return (
    <div className={`h-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">AIOP</p>
      <div className="mt-3 flex h-[calc(100%-2rem)] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-4xl"}`}>나만의 컨트롤 센터</h2>
          <p className={`mt-3 max-w-2xl text-zinc-400 ${isCompact ? "hidden" : ""}`}>
            필요한 기능을 하나의 페이지에서 관리하고, 매일 확인해야 할 선택을 빠르게 정리합니다.
          </p>
        </div>
        <div className={`rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 ${isCompact ? "hidden" : ""}`}>
          오늘은 구매 판단 2개와 구독 리뷰 1개를 보면 충분합니다.
        </div>
      </div>
    </div>
  );
}
