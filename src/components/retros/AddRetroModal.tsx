"use client";

import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Send, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export type QuickRetroSection = "keep" | "problem" | "try";

export type QuickRetroInput = {
  section: QuickRetroSection;
  text: string;
  addToTodo: boolean;
};

type AddRetroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: QuickRetroInput) => void;
};

const sectionLabels: Record<QuickRetroSection, string> = {
  keep: "Keep",
  problem: "Problem",
  try: "Try",
};

export function AddRetroModal({ isOpen, onClose, onAdd }: AddRetroModalProps) {
  const { isCompact } = useCompactMode();
  const [section, setSection] = useState<QuickRetroSection>("try");
  const [text, setText] = useState("");
  const [addToTodo, setAddToTodo] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText) {
      setErrorMessage("회고 내용을 입력하세요.");
      return;
    }

    onAdd({
      section,
      text: trimmedText,
      addToTodo: section === "try" && addToTodo,
    });

    setSection("try");
    setText("");
    setAddToTodo(true);
    setErrorMessage("");
    onClose();
  }

  function handleTextKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className={`fixed inset-0 z-50 flex bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "items-end" : "items-center justify-center p-4"}`} onClick={onClose}>
      <div className={`w-full overflow-y-auto bg-zinc-900 shadow-soft border-zinc-800 ${isCompact ? "rounded-t-2xl border-x border-t max-h-[88dvh] p-4" : "rounded-2xl border max-h-[90vh] max-w-xl p-6"}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={`font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>K.P.T 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">오늘 회고에 빠르게 항목을 추가합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isCompact ? "mt-4" : "mt-6"} space-y-4`}>
          <div className="grid grid-cols-3 gap-2">
            {(["keep", "problem", "try"] as const).map((nextSection) => (
              <button
                key={nextSection}
                type="button"
                onClick={() => setSection(nextSection)}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  section === nextSection
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {sectionLabels[nextSection]}
              </button>
            ))}
          </div>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">{sectionLabels[section]} 내용</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleTextKeyDown}
              rows={5}
              className="mt-3 min-h-32 w-full resize-y bg-transparent text-sm leading-6 text-zinc-100 outline-none"
              autoFocus
            />
          </label>

          {section === "try" ? (
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={addToTodo}
                onChange={(event) => setAddToTodo(event.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
              Todo로도 추가
            </label>
          ) : null}

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-zinc-50">
              취소
            </button>
            <button type="submit" className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
              <Send className="h-4 w-4" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
