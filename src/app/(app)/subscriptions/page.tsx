import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";
import { getSubscriptions } from "@/app/subscriptions/actions";

export default async function SubscriptionsPage() {
  const items = await getSubscriptions();
  return <SubscriptionsView initialItems={items} />;
}
