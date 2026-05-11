"use client";

import { useMemo } from "react";
import {
  DASHBOARD_LAYOUT_STORAGE_KEY,
  defaultDashboardLayout,
  defaultWidgetLayouts,
  editableWidgetIds,
  summaryCardIds,
  widgetIds,
} from "@/components/layout/grid/defaultLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { DashboardLayout, SummaryCardId, WidgetId, WidgetLayout } from "@/types/layout";

function isWidgetId(value: unknown): value is WidgetId {
  return typeof value === "string" && widgetIds.includes(value as WidgetId);
}

function isSummaryCardId(value: unknown): value is SummaryCardId {
  return typeof value === "string" && summaryCardIds.includes(value as SummaryCardId);
}

function isFiniteGridNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeWidgetLayout(value: unknown): WidgetLayout | null {
  if (!value || typeof value !== "object") return null;

  const layout = value as Partial<WidgetLayout>;

  if (!isWidgetId(layout.id)) return null;
  if (!isFiniteGridNumber(layout.x) || !isFiniteGridNumber(layout.y)) return null;
  if (!isFiniteGridNumber(layout.w) || !isFiniteGridNumber(layout.h)) return null;

  return {
    id: layout.id,
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    minW: isFiniteGridNumber(layout.minW) ? layout.minW : undefined,
    minH: isFiniteGridNumber(layout.minH) ? layout.minH : undefined,
  };
}

function normalizeWidgetLayouts(value: unknown): WidgetLayout[] {
  if (!Array.isArray(value)) return defaultWidgetLayouts;

  const layoutsById = new Map<WidgetId, WidgetLayout>();

  value.forEach((item) => {
    const layout = normalizeWidgetLayout(item);
    if (layout) {
      layoutsById.set(layout.id, layout);
    }
  });

  defaultWidgetLayouts.forEach((defaultLayout) => {
    if (!layoutsById.has(defaultLayout.id)) {
      layoutsById.set(defaultLayout.id, defaultLayout);
    }
  });

  const normalizedLayouts = widgetIds.map((id) => layoutsById.get(id) ?? defaultWidgetLayouts.find((item) => item.id === id)!);
  const editableLayouts = normalizedLayouts.filter((layout) => editableWidgetIds.includes(layout.id));
  const minimumEditableY = Math.min(...editableLayouts.map((layout) => layout.y));

  if (Number.isFinite(minimumEditableY) && minimumEditableY > 0) {
    return normalizedLayouts.map((layout) =>
      editableWidgetIds.includes(layout.id)
        ? {
            ...layout,
            y: Math.max(0, layout.y - minimumEditableY),
          }
        : layout,
    );
  }

  return normalizedLayouts;
}

function normalizeSummaryCardsOrder(value: unknown): SummaryCardId[] {
  if (!Array.isArray(value)) return summaryCardIds;

  const uniqueIds = value.filter(isSummaryCardId).filter((id, index, ids) => ids.indexOf(id) === index);
  const missingIds = summaryCardIds.filter((id) => !uniqueIds.includes(id));

  return [...uniqueIds, ...missingIds];
}

function normalizeHiddenSummaryCards(value: unknown): SummaryCardId[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isSummaryCardId)
    .filter((id, index, ids) => ids.indexOf(id) === index);
}

function normalizeWidgetOrder(value: unknown): WidgetId[] {
  if (!Array.isArray(value)) return editableWidgetIds;

  const uniqueIds = value
    .filter(isWidgetId)
    .filter((id) => editableWidgetIds.includes(id))
    .filter((id, index, ids) => ids.indexOf(id) === index);
  const missingIds = editableWidgetIds.filter((id) => !uniqueIds.includes(id));

  return [...uniqueIds, ...missingIds];
}

function normalizeWidgetHeights(value: unknown): Partial<Record<WidgetId, number>> {
  const fallbackHeights = defaultDashboardLayout.narrowWidgetHeights ?? {};

  if (!value || typeof value !== "object") return fallbackHeights;

  const nextHeights: Partial<Record<WidgetId, number>> = {};
  const rawHeights = value as Partial<Record<WidgetId, unknown>>;

  editableWidgetIds.forEach((id) => {
    const height = rawHeights[id];
    nextHeights[id] = isFiniteGridNumber(height) && height > 0 ? height : fallbackHeights[id];
  });

  return nextHeights;
}

function normalizeDashboardLayout(value: unknown): DashboardLayout {
  if (!value || typeof value !== "object") return defaultDashboardLayout;

  const layout = value as Partial<DashboardLayout>;

  if (layout.version !== 1) return defaultDashboardLayout;

  return {
    version: 1,
    breakpoint: layout.breakpoint === "md" || layout.breakpoint === "sm" ? layout.breakpoint : "lg",
    widgets: normalizeWidgetLayouts(layout.widgets),
    summaryCardsOrder: normalizeSummaryCardsOrder(layout.summaryCardsOrder),
    narrowWidgetsOrder: normalizeWidgetOrder(layout.narrowWidgetsOrder),
    narrowWidgetHeights: normalizeWidgetHeights(layout.narrowWidgetHeights),
    hidden: Array.isArray(layout.hidden) ? layout.hidden.filter(isWidgetId) : undefined,
    hiddenSummaryCards: normalizeHiddenSummaryCards(layout.hiddenSummaryCards),
  };
}

export function useDashboardLayout() {
  const [storedLayout, setStoredLayout] = useLocalStorage<unknown>(
    DASHBOARD_LAYOUT_STORAGE_KEY,
    defaultDashboardLayout,
  );

  const layout = useMemo(() => normalizeDashboardLayout(storedLayout), [storedLayout]);

  function saveLayout(nextLayout: DashboardLayout) {
    setStoredLayout({
      ...nextLayout,
      widgets: normalizeWidgetLayouts(nextLayout.widgets),
      summaryCardsOrder: normalizeSummaryCardsOrder(nextLayout.summaryCardsOrder),
      narrowWidgetsOrder: normalizeWidgetOrder(nextLayout.narrowWidgetsOrder),
      narrowWidgetHeights: normalizeWidgetHeights(nextLayout.narrowWidgetHeights),
      hidden: Array.isArray(nextLayout.hidden) ? nextLayout.hidden.filter(isWidgetId) : undefined,
      hiddenSummaryCards: normalizeHiddenSummaryCards(nextLayout.hiddenSummaryCards),
    });
  }

  function resetLayout() {
    setStoredLayout(defaultDashboardLayout);
  }

  function normalizeLayout(nextLayout: DashboardLayout) {
    return normalizeDashboardLayout(nextLayout);
  }

  return {
    layout,
    saveLayout,
    resetLayout,
    normalizeLayout,
  };
}
