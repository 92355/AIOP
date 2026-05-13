import type { Insight, Note, Subscription, TodoItem, WantItem } from "@/types";

export type OptimisticCategory = "want" | "subscription" | "insight" | "note" | "todo";

export type OptimisticPayloadMap = {
  want: WantItem;
  subscription: Subscription;
  insight: Insight;
  note: Note;
  todo: TodoItem;
};

export type DashboardOptimisticApplyEvent = {
  type: "apply";
  category: OptimisticCategory;
  item: OptimisticPayloadMap[OptimisticCategory];
};

export type DashboardOptimisticRollbackEvent = {
  type: "rollback";
  category: OptimisticCategory;
  id: string;
};

export type DashboardOptimisticEvent = DashboardOptimisticApplyEvent | DashboardOptimisticRollbackEvent;

export const DASHBOARD_OPTIMISTIC_EVENT_NAME = "aiop:dashboard-optimistic";

export function dispatchDashboardOptimisticEvent(event: DashboardOptimisticEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DashboardOptimisticEvent>(DASHBOARD_OPTIMISTIC_EVENT_NAME, { detail: event }));
}

