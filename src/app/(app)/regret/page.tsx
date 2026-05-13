import { RegretTrackerView } from "@/components/regret/RegretTrackerView";
import { getRegretItems } from "@/app/regret/actions";

export default async function RegretPage() {
  const items = await getRegretItems();
  return <RegretTrackerView initialItems={items} />;
}
