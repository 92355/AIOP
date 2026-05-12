import type { LucideIcon } from "lucide-react";

export type ViewKey =
  | "dashboard"
  | "wants"
  | "calculator"
  | "regret"
  | "subscriptions"
  | "insights"
  | "notes"
  | "todos"
  | "retros";

export type NavItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  href: string;
};

export type WantStatus = "thinking" | "planned" | "bought" | "skipped";
export type WantPriority = "low" | "medium" | "high";
export type Currency = "KRW" | "USD";

export type WantItem = {
  id: string;
  name: string;
  price: number;
  category: "Productivity" | "Lifestyle" | "Investment" | "Hobby";
  reason: string;
  status: WantStatus;
  score: number;
  requiredCapital: number;
  targetDate: string;
  priority?: WantPriority;
  targetMonths?: number;
  expectedYield?: number;
  monthlyCashflowNeeded?: number;
  currency?: Currency;
};

export type RegretItem = {
  id: string;
  name: string;
  assetType: string;
  symbol?: string;
  watchedPrice: number;
  currentPrice: number;
  currency: Currency;
  quantity: number;
  watchedAt?: string;
  note: string;
  resultPercent: number;
  profitAmount: number;
};

export type SubscriptionStatus = "keep" | "review" | "cancel";

export type Subscription = {
  id: string;
  service: string;
  monthlyPrice: number;
  category: string;
  usage: "daily" | "weekly" | "monthly" | "rare";
  valueScore: number;
  status: SubscriptionStatus;
  billingDay?: number; // 매월 결제일 (1-31), 미입력 시 생략
};

export type InsightType = "book" | "video" | "article" | "thought";

export type Insight = {
  id: string;
  title: string;
  sourceType: InsightType;
  keySentence: string;
  actionItem: string;
  tags: string[];
  relatedGoal: string;
};

export type NoteStatus = "inbox" | "processed" | "archived";

export type Note = {
  id: string;
  title?: string;
  body: string;
  tags: string[];
  createdAt: string;
  status?: NoteStatus;
};

export type TodoStatus = "todo" | "doing" | "done";

export type TodoItem = {
  id: string;
  title: string;
  memo?: string;
  status: TodoStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  dueDate?: string;
};

export type RetroItem = {
  id: string;
  text: string;
  done?: boolean;
  linkedTodoId?: string;
  carriedFrom?: string;
};

export type KptRetro = {
  id: string;
  date: string;
  keep: RetroItem[];
  problem: RetroItem[];
  try: RetroItem[];
  createdAt: string;
  updatedAt: string;
};
