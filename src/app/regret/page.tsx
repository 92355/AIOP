import { RegretTrackerView } from "@/components/regret/RegretTrackerView";
import { getRegretItems } from "./actions";

export default async function RegretPage() {
  const items = await getRegretItems();
  return <RegretTrackerView initialItems={items} />;
}
