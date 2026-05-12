export type WidgetId =
  | "hero"
  | "summary-cards"
  | "want-preview"
  | "asset-snapshot"
  | "subscription-summary"
  | "recent-insights"
  | "todo-summary";

export type SummaryCardId =
  | "wants-count"
  | "subscriptions-monthly"
  | "planned-spend"
  | "recent-insight"
  | "inbox-count"
  | "todo-count";

export type WidgetLayout = {
  id: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export type DashboardLayout = {
  version: 1;
  breakpoint: "lg" | "md" | "sm";
  widgets: WidgetLayout[];
  summaryCardsOrder: SummaryCardId[];
  todoSummaryOrder?: string[];
  narrowWidgetsOrder?: WidgetId[];
  narrowWidgetHeights?: Partial<Record<WidgetId, number>>;
  hidden?: WidgetId[];
  hiddenSummaryCards?: SummaryCardId[];
};
