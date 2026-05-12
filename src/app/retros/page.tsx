import { Suspense } from "react";
import { RetroView } from "@/components/retros/RetroView";

export default function RetrosPage() {
  return (
    <Suspense fallback={null}>
      <RetroView />
    </Suspense>
  );
}
