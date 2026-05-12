import type {
  WantItem,
  RegretItem,
  Subscription,
  Insight,
  Note,
  TodoItem,
  KptRetro,
  RetroItem,
  Currency,
  WantStatus,
  WantPriority,
  SubscriptionStatus,
  InsightType,
  NoteStatus,
  TodoStatus,
} from '@/types'

// ============================================================
// DB Row 타입 (Supabase 테이블 컬럼 그대로)
// ============================================================

export type DbWant = {
  id: string
  user_id: string
  name: string
  price: number
  category: string
  reason: string
  status: string
  score: number
  required_capital: number
  target_date: string
  priority: string | null
  target_months: number | null
  expected_yield: number | null
  monthly_cashflow_needed: number | null
  currency: string
  created_at: string
  updated_at: string
}

export type DbSubscription = {
  id: string
  user_id: string
  service: string
  monthly_price: number
  category: string
  usage: string
  value_score: number
  status: string
  billing_day: number | null
  created_at: string
  updated_at: string
}

export type DbInsight = {
  id: string
  user_id: string
  title: string
  source_type: string
  key_sentence: string
  action_item: string
  tags: string[]
  related_goal: string
  created_at: string
  updated_at: string
}

export type DbNote = {
  id: string
  user_id: string
  title: string | null
  body: string
  tags: string[]
  status: string
  created_at: string
  updated_at: string
}

export type DbTodo = {
  id: string
  user_id: string
  title: string
  memo: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export type DbRetro = {
  id: string
  user_id: string
  date: string
  keep: RetroItem[]
  problem: RetroItem[]
  try: RetroItem[]
  created_at: string
  updated_at: string
}

export type DbRegretItem = {
  id: string
  user_id: string
  name: string
  asset_type: string
  symbol: string | null
  watched_price: number
  current_price: number
  currency: string
  quantity: number
  watched_at: string | null
  note: string
  created_at: string
  updated_at: string
}

export type DbProfile = {
  user_id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// DB → TS 변환 (읽기)
// ============================================================

export function dbToWant(row: DbWant): WantItem {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category as WantItem['category'],
    reason: row.reason,
    status: row.status as WantStatus,
    score: row.score,
    requiredCapital: row.required_capital,
    targetDate: row.target_date,
    priority: row.priority as WantPriority | undefined,
    targetMonths: row.target_months ?? undefined,
    expectedYield: row.expected_yield ?? undefined,
    monthlyCashflowNeeded: row.monthly_cashflow_needed ?? undefined,
    currency: row.currency as Currency,
  }
}

export function dbToSubscription(row: DbSubscription): Subscription {
  return {
    id: row.id,
    service: row.service,
    monthlyPrice: row.monthly_price,
    category: row.category,
    usage: row.usage as Subscription['usage'],
    valueScore: row.value_score,
    status: row.status as SubscriptionStatus,
    billingDay: row.billing_day ?? undefined,
  }
}

export function dbToInsight(row: DbInsight): Insight {
  return {
    id: row.id,
    title: row.title,
    sourceType: row.source_type as InsightType,
    keySentence: row.key_sentence,
    actionItem: row.action_item,
    tags: row.tags,
    relatedGoal: row.related_goal,
  }
}

export function dbToNote(row: DbNote): Note {
  return {
    id: row.id,
    title: row.title ?? undefined,
    body: row.body,
    tags: row.tags,
    createdAt: row.created_at,
    status: row.status as NoteStatus,
  }
}

export function dbToTodo(row: DbTodo): TodoItem {
  return {
    id: row.id,
    title: row.title,
    memo: row.memo ?? undefined,
    status: row.status as TodoStatus,
    priority: row.priority as TodoItem['priority'],
    createdAt: row.created_at,
    dueDate: row.due_date ?? undefined,
  }
}

export function dbToRetro(row: DbRetro): KptRetro {
  return {
    id: row.id,
    date: row.date,
    keep: row.keep,
    problem: row.problem,
    try: row.try,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function dbToRegretItem(row: DbRegretItem): RegretItem {
  const resultPercent =
    row.watched_price > 0
      ? ((row.current_price - row.watched_price) / row.watched_price) * 100
      : 0
  const profitAmount = (row.current_price - row.watched_price) * row.quantity

  return {
    id: row.id,
    name: row.name,
    assetType: row.asset_type,
    symbol: row.symbol ?? undefined,
    watchedPrice: row.watched_price,
    currentPrice: row.current_price,
    currency: row.currency as Currency,
    quantity: row.quantity,
    watchedAt: row.watched_at ?? undefined,
    note: row.note,
    resultPercent,
    profitAmount,
  }
}

// ============================================================
// TS → DB 변환 (쓰기)
// user_id 는 Server Action에서 주입
// ============================================================

export function wantToDb(item: WantItem, userId: string): Omit<DbWant, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    price: item.price,
    category: item.category,
    reason: item.reason,
    status: item.status,
    score: item.score,
    required_capital: item.requiredCapital,
    target_date: item.targetDate,
    priority: item.priority ?? null,
    target_months: item.targetMonths ?? null,
    expected_yield: item.expectedYield ?? null,
    monthly_cashflow_needed: item.monthlyCashflowNeeded ?? null,
    currency: item.currency ?? 'KRW',
  }
}

export function subscriptionToDb(item: Subscription, userId: string): Omit<DbSubscription, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    service: item.service,
    monthly_price: item.monthlyPrice,
    category: item.category,
    usage: item.usage,
    value_score: item.valueScore,
    status: item.status,
    billing_day: item.billingDay ?? null,
  }
}

export function insightToDb(item: Insight, userId: string): Omit<DbInsight, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    title: item.title,
    source_type: item.sourceType,
    key_sentence: item.keySentence,
    action_item: item.actionItem,
    tags: item.tags,
    related_goal: item.relatedGoal,
  }
}

export function noteToDb(item: Note, userId: string): Omit<DbNote, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    title: item.title ?? null,
    body: item.body,
    tags: item.tags,
    status: item.status ?? 'inbox',
  }
}

export function todoToDb(item: TodoItem, userId: string): Omit<DbTodo, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    title: item.title,
    memo: item.memo ?? null,
    status: item.status,
    priority: item.priority,
    due_date: item.dueDate ?? null,
  }
}

export function retroToDb(item: KptRetro, userId: string): Omit<DbRetro, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    date: item.date,
    keep: item.keep,
    problem: item.problem,
    try: item.try,
  }
}

export function regretItemToDb(item: RegretItem, userId: string): Omit<DbRegretItem, 'created_at' | 'updated_at'> {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    asset_type: item.assetType,
    symbol: item.symbol ?? null,
    watched_price: item.watchedPrice,
    current_price: item.currentPrice,
    currency: item.currency,
    quantity: item.quantity,
    watched_at: item.watchedAt ?? null,
    note: item.note,
  }
}
