"use client";

import { ChevronDown, ChevronUp, GripHorizontal } from "lucide-react";
import { useLayoutContext } from "@/contexts/LayoutContext";
import type { WidgetId } from "@/types/layout";

type WidgetFrameProps = {
  id: WidgetId;
  title: string;
  children: React.ReactNode;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function WidgetFrame({ title, children, canMoveUp = false, canMoveDown = false, onMoveUp, onMoveDown }: WidgetFrameProps) {
  const { isEditMode } = useLayoutContext();
  const showMoveControls = isEditMode && (onMoveUp || onMoveDown);

  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl ${
        isEditMode ? "outline outline-1 outline-emerald-400/40 outline-offset-2" : ""
      }`}
    >
      {isEditMode ? (
        <div className="widget-drag-handle absolute left-3 top-3 z-20 flex cursor-grab items-center gap-2 rounded-full border border-emerald-400/30 bg-zinc-950/90 px-3 py-1 text-xs font-medium text-emerald-200 shadow-soft active:cursor-grabbing">
          <GripHorizontal className="h-3.5 w-3.5" />
          <span>{title}</span>
        </div>
      ) : null}
      {showMoveControls ? (
        <div className="absolute right-3 top-3 z-20 flex overflow-hidden rounded-full border border-zinc-700 bg-zinc-950/90 shadow-soft">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="flex h-8 w-8 items-center justify-center text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-700 disabled:hover:bg-transparent"
            aria-label={`${title} 위로 이동`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="flex h-8 w-8 items-center justify-center border-l border-zinc-700 text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-700 disabled:hover:bg-transparent"
            aria-label={`${title} 아래로 이동`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div className="h-full min-h-0 overflow-hidden [&>section]:h-full [&>section]:overflow-hidden">{children}</div>
    </div>
  );
}
