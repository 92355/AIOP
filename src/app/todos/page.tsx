import { getTodos } from "@/app/todos/actions";
import { TodoView } from "@/components/todos/TodoView";

export default async function TodosPage() {
  const items = await getTodos();
  return <TodoView initialItems={items} />;
}
