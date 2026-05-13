import { BookInsightsView } from "@/components/insights/BookInsightsView";
import { getInsights } from "@/app/insights/actions";

export default async function InsightsPage() {
  const items = await getInsights();
  return <BookInsightsView initialItems={items} />;
}
