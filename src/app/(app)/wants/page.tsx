import { WantsView } from "@/components/wants/WantsView";
import { getWants } from "@/app/wants/actions";

export default async function WantsPage() {
  const items = await getWants();
  return <WantsView initialItems={items} />;
}
