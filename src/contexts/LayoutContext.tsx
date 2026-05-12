"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import type { DashboardLayout, SummaryCardId, WidgetId, WidgetLayout } from "@/types/layout";

type LayoutContextValue = {
  isEditMode: boolean;
  layout: DashboardLayout;
  setLayout: (nextWidgets: WidgetLayout[]) => void;
  setNarrowLayout: (nextWidgets: WidgetLayout[]) => void;
  setCardsOrder: (nextOrder: SummaryCardId[]) => void;
  setTodoSummaryOrder: (nextOrder: string[]) => void;
  toggleWidgetVisibility: (widgetId: WidgetId) => void;
  toggleSummaryCardVisibility: (cardId: SummaryCardId) => void;
  saveLayout: () => void;
  resetLayout: () => void;
  discardLayoutChanges: () => void;
  toggleEditMode: () => void;
  setEditMode: (nextValue: boolean) => void;
  hasUnsavedChanges: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  const [draftLayout, setDraftLayout] = useState<DashboardLayout | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { layout: savedLayout, saveLayout: persistLayout, resetLayout: resetSavedLayout, normalizeLayout } = useDashboardLayout();

  const layout = draftLayout ?? savedLayout;

  useEffect(() => {
    if (!isEditMode) {
      setDraftLayout(savedLayout);
    }
  }, [isEditMode, savedLayout]);

  function setLayout(nextWidgets: WidgetLayout[]) {
    setDraftLayout((currentLayout) =>
      normalizeLayout(
        mergeWidgetLayouts(currentLayout ?? savedLayout, nextWidgets),
      ),
    );
    setHasUnsavedChanges(true);
  }

  function setNarrowLayout(nextWidgets: WidgetLayout[]) {
    const nextOrder = nextWidgets.map((widget) => widget.id);
    const nextHeights = nextWidgets.reduce<NonNullable<DashboardLayout["narrowWidgetHeights"]>>((heights, widget) => {
      heights[widget.id] = widget.h;
      return heights;
    }, {});

    setDraftLayout((currentLayout) =>
      normalizeLayout({
        ...(currentLayout ?? savedLayout),
        narrowWidgetsOrder: nextOrder,
        narrowWidgetHeights: nextHeights,
      }),
    );
    setHasUnsavedChanges(true);
  }

  function setCardsOrder(nextOrder: SummaryCardId[]) {
    setDraftLayout((currentLayout) =>
      normalizeLayout({
        ...(currentLayout ?? savedLayout),
        summaryCardsOrder: nextOrder,
      }),
    );
    setHasUnsavedChanges(true);
  }

  function setTodoSummaryOrder(nextOrder: string[]) {
    setDraftLayout((currentLayout) =>
      normalizeLayout({
        ...(currentLayout ?? savedLayout),
        todoSummaryOrder: nextOrder,
      }),
    );
    setHasUnsavedChanges(true);
  }

  function toggleWidgetVisibility(widgetId: WidgetId) {
    setEditMode(true);
    setDraftLayout((currentLayout) => {
      const baseLayout = currentLayout ?? savedLayout;
      const hidden = baseLayout.hidden ?? [];
      const nextHidden = hidden.includes(widgetId)
        ? hidden.filter((id) => id !== widgetId)
        : [...hidden, widgetId];

      return normalizeLayout({
        ...baseLayout,
        hidden: nextHidden,
      });
    });
    setHasUnsavedChanges(true);
  }

  function toggleSummaryCardVisibility(cardId: SummaryCardId) {
    setEditMode(true);
    setDraftLayout((currentLayout) => {
      const baseLayout = currentLayout ?? savedLayout;
      const hiddenSummaryCards = baseLayout.hiddenSummaryCards ?? [];
      const nextHiddenSummaryCards = hiddenSummaryCards.includes(cardId)
        ? hiddenSummaryCards.filter((id) => id !== cardId)
        : [...hiddenSummaryCards, cardId];

      return normalizeLayout({
        ...baseLayout,
        hiddenSummaryCards: nextHiddenSummaryCards,
      });
    });
    setHasUnsavedChanges(true);
  }

  function saveLayout() {
    persistLayout(layout);
    setHasUnsavedChanges(false);
    setEditMode(false);
  }

  function resetLayout() {
    resetSavedLayout();
    setDraftLayout(null);
    setHasUnsavedChanges(false);
    setEditMode(false);
  }

  function discardLayoutChanges() {
    setDraftLayout(savedLayout);
    setHasUnsavedChanges(false);
    setEditMode(false);
  }

  function toggleEditMode() {
    if (isEditMode) {
      discardLayoutChanges();
      return;
    }

    setDraftLayout(savedLayout);
    setHasUnsavedChanges(false);
    setEditMode(true);
  }

  return (
    <LayoutContext.Provider
      value={{
        isEditMode,
        layout,
        setLayout,
        setNarrowLayout,
        setCardsOrder,
        setTodoSummaryOrder,
        toggleWidgetVisibility,
        toggleSummaryCardVisibility,
        saveLayout,
        resetLayout,
        discardLayoutChanges,
        toggleEditMode,
        setEditMode,
        hasUnsavedChanges,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

function mergeWidgetLayouts(layout: DashboardLayout, nextWidgets: WidgetLayout[]): DashboardLayout {
  const nextWidgetsById = new Map(nextWidgets.map((widget) => [widget.id, widget]));

  return {
    ...layout,
    widgets: layout.widgets.map((widget) => nextWidgetsById.get(widget.id) ?? widget),
  };
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error("useLayoutContext must be used within LayoutProvider");
  }

  return context;
}
