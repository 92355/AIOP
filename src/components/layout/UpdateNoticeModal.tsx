"use client";

import { ArrowRight, CheckCircle2, Route, Sparkles, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type UpdateNoticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const updates = [
  {
    title: "화면별 URL 분리",
    description: "구매 목표, 계산기, 구독, 노트 같은 화면을 바로 URL로 열 수 있습니다.",
    icon: Route,
  },
  {
    title: "뒤로가기 / 앞으로가기 개선",
    description: "브라우저 이동 기록과 현재 화면이 자연스럽게 맞춰집니다.",
    icon: ArrowRight,
  },
  {
    title: "빠른 추가 흐름 정리",
    description: "항목을 저장하면 관련 화면으로 이동하고 목록이 바로 갱신됩니다.",
    icon: CheckCircle2,
  },
];

export function UpdateNoticeModal({ isOpen, onClose }: UpdateNoticeModalProps) {
  const { isCompact } = useCompactMode();
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "p-0" : "p-4"}`}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-notice-title"
        className={`w-full overflow-y-auto border border-zinc-800 bg-zinc-900 shadow-soft ${
          isCompact ? "h-[100dvh] max-w-full rounded-none p-4" : "max-w-xl rounded-2xl p-6"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-emerald-300/80">
              <Sparkles className="h-3.5 w-3.5" />
              업데이트
            </p>
            <h2 id="update-notice-title" className="mt-2 text-2xl font-semibold text-zinc-50">
              라우트 분리가 적용되었습니다
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              AIOP 화면 이동 구조를 App Router 기준으로 정리했습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 text-zinc-400 hover:text-zinc-50"
            aria-label="업데이트 공지 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {updates.map((update) => {
            const Icon = update.icon;

            return (
              <article key={update.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-100">{update.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{update.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          확인
        </button>
      </section>
    </div>
  );
}
