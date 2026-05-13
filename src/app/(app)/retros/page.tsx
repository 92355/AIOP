import { getRetros } from "@/app/retros/actions";
import { getTodos } from "@/app/todos/actions";
import { RetroView } from "@/components/retros/RetroView";

export default async function RetrosPage() {
  const [retros, todos] = await Promise.all([getRetros(), getTodos()]);
  return <RetroView initialRetros={retros} initialTodos={todos} />;
}
