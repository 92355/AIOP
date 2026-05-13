"use client";

import { useState } from "react";
import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, CheckSquare, GripVertical } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLayoutContext } from "@/contexts/LayoutContext";
import { FlipNumber } from "@/components/ui/FlipNumber";
import { updateTodoStatus } from "@/app/todos/actions";
import type { TodoItem } from "@/types";

const maxPreviewItemCount = 4;
const priorityRank: Record<TodoItem["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortTodosByPriorityAndCreatedOrder(items: TodoItem[]) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((firstItem, secondItem) => {
      const priorityDiff = priorityRank[firstItem.item.priority] - priorityRank[secondItem.item.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return firstItem.index - secondItem.index;
    })
    .map(({ item }) => item);
}

function applyCustomTodoOrder(items: TodoItem[], order: string[]) {
  if (order.length === 0) return items;

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const orderedItems = order.map((id) => itemsById.get(id)).filter((item): item is TodoItem => Boolean(item));
  const missingItems = items.filter((item) => !order.includes(item.id));

  return [...orderedItems, ...missingItems];
}

export function TodoSummary({ initialTodos }: { initialTodos: TodoItem[] }) {
  const { isCompact } = useCompactMode();
  const { isEditMode, layout, setTodoSummaryOrder } = useLayoutContext();
  const [items, setItems] = useState<TodoItem[]>(initialTodos);

  const activeItems = items.filter((item) => item.status !== "done");
  const doneCount = items.filter((item) => item.status === "done").length;
  const prioritySortedItems = sortTodosByPriorityAndCreatedOrder(activeItems);
  const orderedItems = applyCustomTodoOrder(prioritySortedItems, layout.todoSummaryOrder ?? []);
  const previewItems = orderedItems.slice(0, maxPreviewItemCount);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setTodoSummaryOrder(arrayMove(orderedItems, oldIndex, newIndex).map((item) => item.id));
  }

  async function handleCompleteTodo(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "done" } : item)));
    await updateTodoStatus(id, "done");
  }

  return (
    <section className={`flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Todo 요약</h3>
          {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">진행 중 Todo를 우선순위로 보여줍니다.</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <CheckSquare className="h-5 w-5" />
        </div>
      </div>

      <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "grid-cols-3"}`}>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">대기</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50"><FlipNumber value={`${items.filter((item) => item.status === "todo").length}개`} /></p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">진행 중</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300"><FlipNumber value={`${items.filter((item) => item.status === "doing").length}개`} /></p>
        </div>
        <div className={`rounded-2xl bg-zinc-950/70 p-4 ${isCompact ? "hidden" : ""}`}>
          <p className="text-sm text-zinc-500">완료</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100"><FlipNumber value={`${doneCount}개`} /></p>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {previewItems.length === 0 ? <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">진행 중인 Todo가 없습니다.</div> : null}
        {isEditMode ? (
          <SortableTodoSummaryItems items={previewItems} onDragEnd={handleDragEnd} />
        ) : (
          <div className="space-y-2">
            {previewItems.map((item) => (
              <TodoSummaryItem key={item.id} item={item} onComplete={handleCompleteTodo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SortableTodoSummaryItems({ items, onDragEnd }: { items: TodoItem[]; onDragEnd: (event: DragEndEvent) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableTodoSummaryItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTodoSummaryItem({ item }: { item: TodoItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-30 opacity-80" : ""}>
      <TodoSummaryItem item={item} dragHandleProps={{ attributes, listeners }} />
    </div>
  );
}

function TodoSummaryItem({
  item,
  dragHandleProps,
  onComplete,
}: {
  item: TodoItem;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
  onComplete?: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
      {dragHandleProps ? (
        <button
          type="button"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
          className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-full border border-zinc-800 text-zinc-500 active:cursor-grabbing"
          aria-label="Todo 요약 순서 변경"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onComplete?.(item.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
          aria-label="Todo 완료"
          title="완료"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-200">{item.title}</p>
        {item.memo ? <p className="mt-1 truncate text-xs text-zinc-500">{item.memo}</p> : null}
      </div>
      <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getPriorityLabel(item.priority)}</span>
    </div>
  );
}

function getPriorityLabel(priority: TodoItem["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}
