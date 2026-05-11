import type {
  Currency,
  Insight,
  InsightType,
  Note,
  NoteStatus,
  RegretItem,
  Subscription,
  SubscriptionStatus,
  TodoItem,
  TodoStatus,
  WantItem,
  WantPriority,
  WantStatus,
} from "@/types";

// 공통 가드 / common guards
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

// Wants
const wantCategories = ["Productivity", "Lifestyle", "Investment", "Hobby"] as const;
const wantStatuses = ["thinking", "planned", "bought", "skipped"] as const;
const wantPriorities = ["low", "medium", "high"] as const;
const currencies = ["KRW", "USD"] as const;

function normalizeWant(value: unknown): WantItem | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.name)) return null;
  if (!isFiniteNumber(value.price)) return null;
  if (!isOneOf<WantItem["category"]>(value.category, wantCategories)) return null;
  if (!isOneOf<WantStatus>(value.status, wantStatuses)) return null;
  if (!isFiniteNumber(value.score)) return null;
  if (!isFiniteNumber(value.requiredCapital)) return null;
  if (typeof value.targetDate !== "string") return null;

  return {
    id: value.id,
    name: value.name,
    price: value.price,
    category: value.category,
    reason: typeof value.reason === "string" ? value.reason : "",
    status: value.status,
    score: value.score,
    requiredCapital: value.requiredCapital,
    targetDate: value.targetDate,
    priority: isOneOf<WantPriority>(value.priority, wantPriorities) ? value.priority : undefined,
    targetMonths: isFiniteNumber(value.targetMonths) ? value.targetMonths : undefined,
    expectedYield: isFiniteNumber(value.expectedYield) ? value.expectedYield : undefined,
    monthlyCashflowNeeded: isFiniteNumber(value.monthlyCashflowNeeded) ? value.monthlyCashflowNeeded : undefined,
    currency: isOneOf<Currency>(value.currency, currencies) ? value.currency : undefined,
  };
}

export function normalizeWants(value: unknown): WantItem[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeWant).filter((item): item is WantItem => item !== null);
}

// Subscriptions
const subscriptionStatuses = ["keep", "review", "cancel"] as const;
const usageValues = ["daily", "weekly", "monthly", "rare"] as const;

function normalizeSubscription(value: unknown): Subscription | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.service)) return null;
  if (!isFiniteNumber(value.monthlyPrice)) return null;
  if (typeof value.category !== "string") return null;
  if (!isOneOf<Subscription["usage"]>(value.usage, usageValues)) return null;
  if (!isFiniteNumber(value.valueScore)) return null;
  if (!isOneOf<SubscriptionStatus>(value.status, subscriptionStatuses)) return null;

  return {
    id: value.id,
    service: value.service,
    monthlyPrice: value.monthlyPrice,
    category: value.category,
    usage: value.usage,
    valueScore: value.valueScore,
    status: value.status,
  };
}

export function normalizeSubscriptions(value: unknown): Subscription[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeSubscription).filter((item): item is Subscription => item !== null);
}

// Insights
const insightTypes = ["book", "video", "article", "thought"] as const;

function normalizeInsight(value: unknown): Insight | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.title)) return null;
  if (!isOneOf<InsightType>(value.sourceType, insightTypes)) return null;

  return {
    id: value.id,
    title: value.title,
    sourceType: value.sourceType,
    keySentence: typeof value.keySentence === "string" ? value.keySentence : "",
    actionItem: typeof value.actionItem === "string" ? value.actionItem : "",
    tags: toStringArray(value.tags),
    relatedGoal: typeof value.relatedGoal === "string" ? value.relatedGoal : "",
  };
}

export function normalizeInsights(value: unknown): Insight[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeInsight).filter((item): item is Insight => item !== null);
}

// Notes
const noteStatuses = ["inbox", "processed", "archived"] as const;

function normalizeNote(value: unknown): Note | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (typeof value.body !== "string") return null;
  if (typeof value.createdAt !== "string") return null;

  return {
    id: value.id,
    title: typeof value.title === "string" ? value.title : undefined,
    body: value.body,
    tags: toStringArray(value.tags),
    createdAt: value.createdAt,
    status: isOneOf<NoteStatus>(value.status, noteStatuses) ? value.status : undefined,
  };
}

export function normalizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeNote).filter((item): item is Note => item !== null);
}

// Regret items
function normalizeRegretItem(value: unknown): RegretItem | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.name)) return null;
  if (typeof value.assetType !== "string") return null;
  if (!isFiniteNumber(value.watchedPrice)) return null;
  if (!isFiniteNumber(value.currentPrice)) return null;
  if (!isOneOf<Currency>(value.currency, currencies)) return null;
  if (!isFiniteNumber(value.quantity)) return null;
  if (!isFiniteNumber(value.resultPercent)) return null;
  if (!isFiniteNumber(value.profitAmount)) return null;

  return {
    id: value.id,
    name: value.name,
    assetType: value.assetType,
    symbol: typeof value.symbol === "string" ? value.symbol : undefined,
    watchedPrice: value.watchedPrice,
    currentPrice: value.currentPrice,
    currency: value.currency,
    quantity: value.quantity,
    watchedAt: typeof value.watchedAt === "string" ? value.watchedAt : undefined,
    note: typeof value.note === "string" ? value.note : "",
    resultPercent: value.resultPercent,
    profitAmount: value.profitAmount,
  };
}

export function normalizeRegretItems(value: unknown): RegretItem[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeRegretItem).filter((item): item is RegretItem => item !== null);
}

// Todos
const todoStatuses = ["todo", "doing", "done"] as const;
const todoPriorities = ["low", "medium", "high"] as const;

function normalizeTodo(value: unknown): TodoItem | null {
  if (!isObject(value)) return null;

  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.title)) return null;
  if (!isOneOf<TodoStatus>(value.status, todoStatuses)) return null;
  if (!isOneOf<TodoItem["priority"]>(value.priority, todoPriorities)) return null;
  if (typeof value.createdAt !== "string") return null;

  return {
    id: value.id,
    title: value.title,
    status: value.status,
    priority: value.priority,
    createdAt: value.createdAt,
    dueDate: typeof value.dueDate === "string" ? value.dueDate : undefined,
  };
}

export function normalizeTodos(value: unknown): TodoItem[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeTodo).filter((item): item is TodoItem => item !== null);
}
