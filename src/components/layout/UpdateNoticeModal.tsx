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
    title: "우리 홈페이지의 목표",
    description: "생활에 가장 밀접하게 필요한 기능 바로 사용할 수 있는 홈페이지",
    icon: Route,
  },
  {
    title: "AI와 연계하여, 구매 점수 판별, 수익률 계산등 자산관리의 디지털 혁신",
    description: "AI가 평가해주는 내 지름 점수. 그때 샀더라면 지금 웃고있을까? ",
    icon: ArrowRight,
  },
  {
    title: "모바일 OS, PC OS 모두 지원. Web 기반 실시간 동기화 ",
    description: "언제든 옆에 켜두고 입력만 하세요. 기록 관리 동기화 제가 다 할게요!",
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
              반가워요!!
            </p>
            <h2 id="update-notice-title" className="mt-2 text-2xl font-semibold text-zinc-50">
              베타테스트에 회원님과 함께하게 되어 영광입니다!
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              AIOP의 모든 기능을 씹고 뜯으며 많은 피드백 부탁드립니다!
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
