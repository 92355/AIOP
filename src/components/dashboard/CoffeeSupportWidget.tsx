"use client";

import { useState } from "react";
import { Coffee, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";

export function CoffeeSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isCompact } = useCompactMode();

  return (
    <>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">Support</p>
            <h3 className="mt-1 text-sm font-semibold text-zinc-100">개발자 커피사주기</h3>
            <p className="mt-2 text-xs leading-5 text-zinc-500">후원 정보는 모달에서 확인할 수 있습니다.</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <Coffee className="h-4 w-4" />
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-emerald-400 px-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
        >
          열기
        </button>
      </section>

      {isOpen ? (
        <div
          className={`fixed inset-0 z-[80] flex bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "items-end" : "items-center justify-center p-4"}`}
          onClick={() => setIsOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="coffee-support-title"
            className={`w-full overflow-y-auto border border-zinc-800 bg-zinc-900 shadow-soft ${
              isCompact ? "max-h-[80dvh] rounded-t-2xl border-x border-t p-4" : "max-w-lg rounded-2xl p-6"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">Support</p>
                <h2 id="coffee-support-title" className="mt-2 text-xl font-semibold text-zinc-50">
                  개발자 커피사주기
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 text-zinc-400 hover:text-zinc-50"
                aria-label="개발자 커피사주기 모달 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Coffee className="h-4 w-4 text-emerald-300" />
                계좌/송금 정보 직접 입력 영역
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                여기에 계좌번호 또는 카카오페이 안내 문구를 직접 수정해서 넣어주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
            >
              확인
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
