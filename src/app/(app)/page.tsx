import { DashboardGrid } from "@/components/layout/grid/DashboardGrid";
import { getWants } from "@/app/wants/actions";
import { getSubscriptions } from "@/app/subscriptions/actions";
import { getInsights } from "@/app/insights/actions";
import { getNotes } from "@/app/notes/actions";
import { getTodos } from "@/app/todos/actions";

export default async function Home() {
  const [wants, subscriptions, insights, notes, todos] = await Promise.all([
    getWants(),
    getSubscriptions(),
    getInsights(),
    getNotes(),
    getTodos(),
  ]);

  return (
    <DashboardGrid
      initialData={{ wants, subscriptions, insights, notes, todos }}
    />
  );
}
