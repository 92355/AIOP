import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { getSubscriptions } from "./actions";

export default async function SubscriptionsPage() {
  const items = await getSubscriptions();
  return <SubscriptionsView initialItems={items} />;
}
