import { WantsView } from "@/components/wants/WantsView";
import { getWants } from "./actions";

export default async function WantsPage() {
  const items = await getWants();
  return <WantsView initialItems={items} />;
}
