"use client";

import { Eye, EyeOff, RotateCcw, Save, SlidersHorizontal, X } from "lucide-react";
import {
  editableWidgetIds,
  summaryCardIds,
  summaryCardLabels,
  widgetLabels,
} from "@/components/layout/grid/defaultLayout";
import { useLayoutContext } from "@/contexts/LayoutContext";

type SettingsMenuProps = {
  onClose: () => void;
};

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const {
    isEditMode,
    layout,
    hasUnsavedChanges,
    toggleEditMode,
    saveLayout,
    resetLayout,
    toggleWidgetVisibility,
    toggleSummaryCardVisibility,
  } = useLayoutContext();

  const hiddenWidgets = layout.hidden ?? [];
  const hiddenSummaryCards = layout.hiddenSummaryCards ?? [];

  function handleToggleEditMode() {
    toggleEditMode();
    onClose();
  }

  function handleSaveLayout() {
    saveLayout();
    onClose();
  }

  function handleResetLayout() {
    const confirmed = window.confirm("Dashboard layout을 기본값으로 되돌릴까요?");
    if (!confirmed) return;

    resetLayout();
    onClose();
  }

  return (
    <div className="max-h-[min(72vh,720px)] w-72 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-soft">
      {isEditMode ? (
        <button
          type="button"
          onClick={handleSaveLayout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-emerald-200 transition hover:bg-emerald-400/10"
        >
          <Save className="h-4 w-4" />
          <span>{hasUnsavedChanges ? "레이아웃 저장" : "저장 후 종료"}</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={handleToggleEditMode}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-zinc-900"
      >
        {isEditMode ? <X className="h-4 w-4 text-zinc-400" /> : <SlidersHorizontal className="h-4 w-4 text-emerald-300" />}
        <span>{isEditMode ? "저장 안 하고 종료" : "레이아웃 편집"}</span>
      </button>

      <SettingsGroup title="Dashboard 위젯">
        {editableWidgetIds.map((id) => (
          <VisibilityButton
            key={id}
            label={widgetLabels[id]}
            isVisible={!hiddenWidgets.includes(id)}
            onToggle={() => toggleWidgetVisibility(id)}
          />
        ))}
      </SettingsGroup>

      <SettingsGroup title="Summary 상세 카드">
        {summaryCardIds.map((id) => (
          <VisibilityButton
            key={id}
            label={summaryCardLabels[id]}
            isVisible={!hiddenSummaryCards.includes(id)}
            onToggle={() => toggleSummaryCardVisibility(id)}
          />
        ))}
      </SettingsGroup>

      <button
        type="button"
        onClick={handleResetLayout}
        className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
      >
        <RotateCcw className="h-4 w-4" />
        <span>레이아웃 초기화</span>
      </button>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2 border-t border-zinc-800 pt-2">
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function VisibilityButton({
  label,
  isVisible,
  onToggle,
}: {
  label: string;
  isVisible: boolean;
  onToggle: () => void;
}) {
  const Icon = isVisible ? Eye : EyeOff;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        isVisible ? "text-zinc-200 hover:bg-zinc-900" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
          isVisible ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-zinc-800 text-zinc-500"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
