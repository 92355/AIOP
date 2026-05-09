import type { InsightType, NoteStatus, Subscription, SubscriptionStatus, WantItem, WantPriority, WantStatus } from "@/types";

const categoryLabels: Record<WantItem["category"], string> = {
  Productivity: "생산성",
  Lifestyle: "라이프스타일",
  Investment: "투자",
  Hobby: "취미",
};

const wantStatusLabels: Record<WantStatus, string> = {
  thinking: "검토 중",
  planned: "계획됨",
  bought: "구매 완료",
  skipped: "보류",
};

const priorityLabels: Record<WantPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  keep: "유지",
  review: "검토",
  cancel: "해지",
};

const usageLabels: Record<Subscription["usage"], string> = {
  daily: "매일",
  weekly: "매주",
  monthly: "매월",
  rare: "가끔",
};

const subscriptionCategoryLabels: Record<string, string> = {
  AI: "AI",
  Entertainment: "엔터테인먼트",
  Music: "음악",
  Productivity: "생산성",
  Development: "개발",
  Storage: "저장공간",
};

const insightTypeLabels: Record<InsightType, string> = {
  book: "책",
  video: "영상",
  article: "글",
  thought: "생각",
};

const noteStatusLabels: Record<NoteStatus, string> = {
  inbox: "수집함",
  processed: "처리됨",
  archived: "보관됨",
};

export function getWantCategoryLabel(category: WantItem["category"]) {
  return categoryLabels[category];
}

export function getWantStatusLabel(status: WantStatus) {
  return wantStatusLabels[status];
}

export function getWantPriorityLabel(priority: WantPriority) {
  return priorityLabels[priority];
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus) {
  return subscriptionStatusLabels[status];
}

export function getUsageLabel(usage: Subscription["usage"]) {
  return usageLabels[usage];
}

export function getSubscriptionCategoryLabel(category: string) {
  return subscriptionCategoryLabels[category] ?? category;
}

export function getInsightTypeLabel(type: InsightType) {
  return insightTypeLabels[type];
}

export function getNoteStatusLabel(status: NoteStatus) {
  return noteStatusLabels[status];
}
