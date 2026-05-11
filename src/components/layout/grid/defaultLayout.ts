import type { DashboardLayout, SummaryCardId, WidgetId, WidgetLayout } from "@/types/layout";

export const DASHBOARD_LAYOUT_STORAGE_KEY = "aiop:layout";

export const widgetIds: WidgetId[] = [
  "hero",
  "summary-cards",
  "want-preview",
  "asset-snapshot",
  "subscription-summary",
  "recent-insights",
  "todo-summary",
];

export const editableWidgetIds: WidgetId[] = [
  "summary-cards",
  "want-preview",
  "asset-snapshot",
  "subscription-summary",
  "recent-insights",
  "todo-summary",
];

export const summaryCardIds: SummaryCardId[] = [
  "wants-count",
  "subscriptions-monthly",
  "planned-spend",
  "recent-insight",
  "inbox-count",
  "todo-count",
];

export const widgetLabels: Record<WidgetId, string> = {
  hero: "히어로",
  "summary-cards": "요약 카드",
  "want-preview": "구매 목표 미리보기",
  "asset-snapshot": "자산 기준 구매 판단",
  "subscription-summary": "구독 요약",
  "recent-insights": "최근 인사이트",
  "todo-summary": "Todo 요약",
};

export const summaryCardLabels: Record<SummaryCardId, string> = {
  "wants-count": "구매 목표",
  "subscriptions-monthly": "월 구독비",
  "planned-spend": "계획 지출 합계",
  "recent-insight": "최근 인사이트",
  "inbox-count": "수집함",
  "todo-count": "Todo",
};

export const defaultWidgetLayouts: WidgetLayout[] = [
  { id: "hero", x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 3 },
  { id: "summary-cards", x: 0, y: 0, w: 12, h: 3, minW: 8, minH: 3 },
  { id: "want-preview", x: 0, y: 3, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "asset-snapshot", x: 6, y: 3, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "subscription-summary", x: 0, y: 8, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "recent-insights", x: 6, y: 8, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "todo-summary", x: 0, y: 13, w: 6, h: 5, minW: 4, minH: 4 },
];

export const defaultDashboardLayout: DashboardLayout = {
  version: 1,
  breakpoint: "lg",
  widgets: defaultWidgetLayouts,
  summaryCardsOrder: summaryCardIds,
  narrowWidgetsOrder: editableWidgetIds,
  narrowWidgetHeights: {
    "summary-cards": 4,
    "want-preview": 5,
    "asset-snapshot": 6,
    "subscription-summary": 5,
    "recent-insights": 5,
    "todo-summary": 5,
  },
};
