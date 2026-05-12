"use client";

import { useMemo } from "react";
import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Banknote, BookMarked, CheckSquare, CreditCard, GripVertical, NotebookTabs, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { insights, notes, subscriptions, wants } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLayoutContext } from "@/contexts/LayoutContext";
import { formatCompactKRW, formatKRW } from "@/lib/formatters";
import type { Insight, Note, Subscription, TodoItem, WantItem } from "@/types";
import type { SummaryCardId } from "@/types/layout";

type SummaryCard = {
  id: SummaryCardId;
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  targetHref: string;
};

function getStoredArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function sortCardsByOrder(cards: SummaryCard[], order: SummaryCardId[]) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const orderedCards = order.map((id) => cardsById.get(id)).filter((card): card is SummaryCard => Boolean(card));
  const missingCards = cards.filter((card) => !order.includes(card.id));

  return [...orderedCards, ...missingCards];
}

export function SummaryCards() {
  const { isCompact } = useCompactMode();
  const { isEditMode, layout, setCardsOrder } = useLayoutContext();
  const [storedWants] = useLocalStorage<unknown>("aiop:wants", wants);
  const [storedSubscriptions] = useLocalStorage<unknown>("aiop:subscriptions", subscriptions);
  const [storedInsights] = useLocalStorage<unknown>("aiop:insights", insights);
  const [storedNotes] = useLocalStorage<unknown>("aiop:notes", notes);
  const [storedTodos] = useLocalStorage<unknown>("aiop:todos", []);

  const wantItems = getStoredArray<WantItem>(storedWants, wants);
  const subscriptionItems = getStoredArray<Subscription>(storedSubscriptions, subscriptions);
  const insightItems = getStoredArray<Insight>(storedInsights, insights);
  const noteItems = getStoredArray<Note>(storedNotes, notes);
  const todoItems = getStoredArray<TodoItem>(storedTodos, []);

  const monthlyTotal = useMemo(
    () => subscriptionItems.reduce((sum, item) => sum + item.monthlyPrice, 0),
    [subscriptionItems],
  );
  const coverableSpend = useMemo(() => wantItems.reduce((sum, item) => sum + item.price, 0), [wantItems]);
  const inboxNoteCount = useMemo(
    () => noteItems.filter((item) => (item.status ?? "inbox") === "inbox").length,
    [noteItems],
  );
  const activeTodoCount = useMemo(
    () => todoItems.filter((item) => item.status !== "done").length,
    [todoItems],
  );

  const cards: SummaryCard[] = [
    {
      id: "wants-count",
      label: "구매 목표",
      value: `${wantItems.length}개`,
      helper: "기록 중인 구매 목표",
      icon: Sparkles,
      targetHref: "/wants",
    },
    {
      id: "subscriptions-monthly",
      label: "월 구독비",
      value: formatKRW(monthlyTotal),
      helper: "매달 반복되는 지출",
      icon: CreditCard,
      targetHref: "/subscriptions",
    },
    {
      id: "planned-spend",
      label: "계획 지출 합계",
      value: formatCompactKRW(coverableSpend),
      helper: "구매 목표 총액",
      icon: Banknote,
      targetHref: "/wants",
    },
    {
      id: "recent-insight",
      label: "최근 인사이트",
      value: `${insightItems.length}개`,
      helper: "저장한 책, 영상, 생각",
      icon: BookMarked,
      targetHref: "/insights",
    },
    {
      id: "inbox-count",
      label: "수집함",
      value: `${inboxNoteCount}개`,
      helper: "아직 정리하지 않은 메모",
      icon: NotebookTabs,
      targetHref: "/notes",
    },
    {
      id: "todo-count",
      label: "Todo",
      value: `${activeTodoCount}개`,
      helper: "완료 전 Todo",
      icon: CheckSquare,
      targetHref: "/todos",
    },
  ];

  const hiddenSummaryCards = layout.hiddenSummaryCards ?? [];
  const orderedCards = sortCardsByOrder(cards, layout.summaryCardsOrder).filter((card) => !hiddenSummaryCards.includes(card.id));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCards.findIndex((card) => card.id === active.id);
    const newIndex = orderedCards.findIndex((card) => card.id === over.id);

    if (oldIndex < 0 || newIndex < 0) return;

    setCardsOrder(arrayMove(orderedCards, oldIndex, newIndex).map((card) => card.id));
  }

  const gridClassName = `grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-6"}`;

  if (!isEditMode) {
    return (
      <section className={gridClassName}>
        {orderedCards.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-500">
            표시 중인 Summary 카드가 없습니다. 설정에서 카드를 다시 추가하세요.
          </div>
        ) : null}
        {orderedCards.map((card) => (
          <SummaryCardItem key={card.id} card={card} isCompact={isCompact} isLinked />
        ))}
      </section>
    );
  }

  return (
    <SortableSummaryCards cards={orderedCards} gridClassName={gridClassName} isCompact={isCompact} onDragEnd={handleDragEnd} />
  );
}

function SortableSummaryCards({
  cards,
  gridClassName,
  isCompact,
  onDragEnd,
}: {
  cards: SummaryCard[];
  gridClassName: string;
  isCompact: boolean;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={cards.map((card) => card.id)} strategy={rectSortingStrategy}>
        <section className={gridClassName}>
          {cards.map((card) => (
            <SortableSummaryCard key={card.id} card={card} isCompact={isCompact} />
          ))}
        </section>
      </SortableContext>
    </DndContext>
  );
}

function SortableSummaryCard({ card, isCompact }: { card: SummaryCard; isCompact: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "z-30 opacity-80" : ""}
    >
      <SummaryCardItem card={card} isCompact={isCompact} isEditable dragHandleProps={{ attributes, listeners }} />
    </div>
  );
}

function SummaryCardItem({
  card,
  isCompact,
  isEditable = false,
  isLinked = false,
  dragHandleProps,
}: {
  card: SummaryCard;
  isCompact: boolean;
  isEditable?: boolean;
  isLinked?: boolean;
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
}) {
  const Icon = card.icon;
  const className = `group block h-full w-full rounded-2xl border bg-zinc-900 text-left shadow-soft transition duration-200 ${
    isEditable ? "border-emerald-400/30" : "border-zinc-800"
  } ${
    isLinked
      ? "cursor-pointer hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-zinc-800/80 hover:shadow-[0_18px_50px_rgba(52,211,153,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 active:translate-y-0"
      : ""
  } ${
    isCompact ? "p-3" : "p-5"
  }`;
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 transition-colors group-hover:text-zinc-400">{card.label}</p>
          <strong className={`mt-2 block font-semibold text-zinc-50 transition-colors group-hover:text-emerald-200 ${isCompact ? "text-xl" : "text-2xl"}`}>{card.value}</strong>
        </div>
        {dragHandleProps ? (
          <button
            type="button"
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className={`flex shrink-0 cursor-grab items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 active:cursor-grabbing ${isCompact ? "h-9 w-9" : "h-11 w-11"}`}
            aria-label={`${card.label} 순서 변경`}
          >
            <GripVertical className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
          </button>
        ) : (
          <div className={`flex items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 transition duration-200 group-hover:scale-105 group-hover:bg-emerald-400/15 group-hover:text-emerald-200 ${isCompact ? "h-9 w-9" : "h-11 w-11"}`}>
            <Icon className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
          </div>
        )}
      </div>
      {isCompact ? null : <p className="mt-4 text-sm text-zinc-500 transition-colors group-hover:text-zinc-400">{card.helper}</p>}
    </>
  );

  if (isLinked) {
    return (
      <Link href={card.targetHref} className={className} aria-label={`${card.label} 화면으로 이동`}>
        {content}
      </Link>
    );
  }

  return (
    <article className={className}>{content}</article>
  );
}
