import { DashboardGrid } from "@/components/layout/grid/DashboardGrid";
import { createClient } from "@/lib/supabase/server";
import { dbToInsight, dbToNote, dbToSubscription, dbToTodo, dbToWant } from "@/lib/db/mappers";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("인증이 필요합니다.");

  const [wantsResult, subscriptionsResult, insightsResult, notesResult, todosResult] = await Promise.all([
    supabase.from("wants").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (wantsResult.error) throw new Error(wantsResult.error.message);
  if (subscriptionsResult.error) throw new Error(subscriptionsResult.error.message);
  if (insightsResult.error) throw new Error(insightsResult.error.message);
  if (notesResult.error) throw new Error(notesResult.error.message);
  if (todosResult.error) throw new Error(todosResult.error.message);

  const wants = (wantsResult.data ?? []).map(dbToWant);
  const subscriptions = (subscriptionsResult.data ?? []).map(dbToSubscription);
  const insights = (insightsResult.data ?? []).map(dbToInsight);
  const notes = (notesResult.data ?? []).map(dbToNote);
  const todos = (todosResult.data ?? []).map(dbToTodo);

  return (
    <DashboardGrid
      initialData={{ wants, subscriptions, insights, notes, todos }}
    />
  );
}
