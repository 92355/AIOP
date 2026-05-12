"use client";

import { BarChart3, BookOpen, CheckSquare, CreditCard, FileText, NotebookPen, ShoppingBag, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export type QuickAddCategory = "want" | "subscription" | "insight" | "regret" | "note" | "todo" | "retro";

type QuickAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: QuickAddCategory) => void;
};

const categories: Array<{
  key: QuickAddCategory;
  title: string;
  description: string;
  icon: typeof ShoppingBag;
}> = [
  {
    key: "want",
    title: "구매 목표",
    description: "사고 싶은 항목과 필요 자본을 기록합니다.",
    icon: ShoppingBag,
  },
  {
    key: "subscription",
    title: "구독",
    description: "월 구독비와 유지 여부를 추가합니다.",
    icon: CreditCard,
  },
  {
    key: "insight",
    title: "인사이트",
    description: "책, 영상, 아티클에서 얻은 실행 문장을 남깁니다.",
    icon: BookOpen,
  },
  {
    key: "regret",
    title: "후회 기록",
    description: "그때 샀다면 어땠을지 계산할 항목을 추가합니다.",
    icon: BarChart3,
  },
  {
    key: "note",
    title: "메모",
    description: "나중에 분류할 생각을 빠르게 보관합니다.",
    icon: FileText,
  },
  {
    key: "todo",
    title: "Todo",
    description: "오늘 처리할 일을 바로 추가합니다.",
    icon: CheckSquare,
  },
  {
    key: "retro",
    title: "K.P.T",
    description: "오늘 회고의 Keep, Problem, Try를 빠르게 남깁니다.",
    icon: NotebookPen,
  },
];

export function QuickAddModal({ isOpen, onClose, onSelectCategory }: QuickAddModalProps) {
  const { isCompact } = useCompactMode();
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "p-0" : "p-4"}`} onClick={onClose}>
      <div
        className={`w-full overflow-y-auto border border-zinc-800 bg-zinc-900 shadow-soft ${
          isCompact ? "h-[100dvh] max-w-full rounded-none p-4" : "max-w-3xl rounded-2xl p-6"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">빠른 추가</p>
            <h3 className="mt-2 text-2xl font-semibold text-zinc-50">무엇을 추가할까요?</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">추가할 항목의 종류를 선택하세요.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`mt-6 grid gap-3 ${isCompact ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() => onSelectCategory(category.key)}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-left transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-emerald-300 group-hover:border-emerald-400/30">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-4 block text-base font-semibold text-zinc-50">{category.title}</span>
                {isCompact ? null : <span className="mt-2 block text-sm leading-6 text-zinc-500">{category.description}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
