"use client";

import { GripHorizontal } from "lucide-react";
import { useLayoutContext } from "@/contexts/LayoutContext";
import type { WidgetId } from "@/types/layout";

type WidgetFrameProps = {
  id: WidgetId;
  title: string;
  children: React.ReactNode;
};

export function WidgetFrame({ title, children }: WidgetFrameProps) {
  const { isEditMode } = useLayoutContext();

  return (
    <div
      className={`group relative h-full rounded-2xl ${
        isEditMode ? "outline outline-1 outline-emerald-400/40 outline-offset-2" : ""
      }`}
    >
      {isEditMode ? (
        <div className="widget-drag-handle absolute left-3 top-3 z-20 flex cursor-grab items-center gap-2 rounded-full border border-emerald-400/30 bg-zinc-950/90 px-3 py-1 text-xs font-medium text-emerald-200 shadow-soft active:cursor-grabbing">
          <GripHorizontal className="h-3.5 w-3.5" />
          <span>{title}</span>
        </div>
      ) : null}
      <div className="h-full [&>section]:h-full">{children}</div>
    </div>
  );
}
