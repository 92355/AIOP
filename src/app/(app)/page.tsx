import { DashboardGrid } from "@/components/layout/grid/DashboardGrid";
import { createClient } from "@/lib/supabase/server";
import type { Insight, Note, Subscription, TodoItem, WantItem } from "@/types";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("인증이 필요합니다.");

  const [wantsResult, subscriptionsResult, insightsResult, notesResult, todosResult] = await Promise.all([
    supabase
      .from("wants")
      .select("id,name,price,category,status,score,expected_yield")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id,service,monthly_price,status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("insights")
      .select("id,title,source_type,key_sentence,action_item")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id,status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("todos")
      .select("id,title,memo,status,priority,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (wantsResult.error) throw new Error(wantsResult.error.message);
  if (subscriptionsResult.error) throw new Error(subscriptionsResult.error.message);
  if (insightsResult.error) throw new Error(insightsResult.error.message);
  if (notesResult.error) throw new Error(notesResult.error.message);
  if (todosResult.error) throw new Error(todosResult.error.message);

  const wants: WantItem[] = (wantsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    reason: "",
    status: row.status,
    score: row.score,
    requiredCapital: 0,
    targetDate: "",
    expectedYield: row.expected_yield ?? undefined,
    currency: "KRW",
  }));

  const subscriptions: Subscription[] = (subscriptionsResult.data ?? []).map((row) => ({
    id: row.id,
    service: row.service,
    monthlyPrice: row.monthly_price,
    category: "",
    usage: "monthly",
    valueScore: 0,
    status: row.status,
  }));

  const insights: Insight[] = (insightsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    sourceType: row.source_type,
    keySentence: row.key_sentence,
    actionItem: row.action_item,
    tags: [],
    relatedGoal: "",
  }));

  const notes: Note[] = (notesResult.data ?? []).map((row) => ({
    id: row.id,
    body: "",
    tags: [],
    createdAt: row.created_at,
    status: row.status,
  }));

  const todos: TodoItem[] = (todosResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    memo: row.memo ?? undefined,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
  }));

  return (
    <DashboardGrid
      initialData={{ wants, subscriptions, insights, notes, todos }}
    />
  );
}
