"use client";

import { Responsive, useContainerWidth, type Layout, type LayoutItem } from "react-grid-layout";
import { AssetSnapshot } from "@/components/dashboard/AssetSnapshot";
import { HeroWidget } from "@/components/dashboard/HeroWidget";
import { RecentInsights } from "@/components/dashboard/RecentInsights";
import { SubscriptionSummary } from "@/components/dashboard/SubscriptionSummary";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TodoSummary } from "@/components/dashboard/TodoSummary";
import { WantPreview } from "@/components/dashboard/WantPreview";
import { editableWidgetIds } from "@/components/layout/grid/defaultLayout";
import { WidgetFrame } from "@/components/layout/grid/WidgetFrame";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLayoutContext } from "@/contexts/LayoutContext";
import type { Insight, Note, Subscription, TodoItem, WantItem } from "@/types";
import type { WidgetId, WidgetLayout } from "@/types/layout";

type DashboardData = {
  wants: WantItem[];
  subscriptions: Subscription[];
  insights: Insight[];
  notes: Note[];
  todos: TodoItem[];
};

const widgetTitles: Record<WidgetId, string> = {
  hero: "Hero",
  "summary-cards": "Summary",
  "want-preview": "Wants",
  "asset-snapshot": "Assets",
  "subscription-summary": "Subscriptions",
  "recent-insights": "Insights",
  "todo-summary": "Todo",
};

function toGridLayout(layout: WidgetLayout): LayoutItem {
  return {
    i: layout.id,
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    minW: layout.minW,
    minH: layout.minH,
  };
}

function fromGridLayout(layout: LayoutItem): WidgetLayout | null {
  if (!editableWidgetIds.includes(layout.i as WidgetId)) return null;

  return {
    id: layout.i as WidgetId,
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    minW: layout.minW,
    minH: layout.minH,
  };
}

function renderWidget(id: WidgetId, data: DashboardData) {
  switch (id) {
    case "hero":
      return <HeroWidget />;
    case "summary-cards":
      return <SummaryCards initialData={data} />;
    case "want-preview":
      return <WantPreview initialWants={data.wants} />;
    case "asset-snapshot":
      return <AssetSnapshot initialWants={data.wants} />;
    case "subscription-summary":
      return <SubscriptionSummary initialSubscriptions={data.subscriptions} />;
    case "recent-insights":
      return <RecentInsights initialInsights={data.insights} />;
    case "todo-summary":
      return <TodoSummary initialTodos={data.todos} />;
  }
}

export function DashboardGrid({ initialData }: { initialData: DashboardData }) {
  const { isCompact } = useCompactMode();
  const { isEditMode, layout, setLayout, setNarrowLayout } = useLayoutContext();
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 });
  const isMobileGrid = width < 768;
  const isNarrowLayout = isCompact || isMobileGrid;
  const canEditLayout = isEditMode;

  const hiddenWidgets = layout.hidden ?? [];
  const visibleWidgetIds = editableWidgetIds.filter((id) => !hiddenWidgets.includes(id));
  const narrowWidgetOrder = getNormalizedNarrowWidgetOrder(layout.narrowWidgetsOrder ?? editableWidgetIds);
  const visibleNarrowWidgetIds = narrowWidgetOrder.filter((id) => visibleWidgetIds.includes(id));
  const editableLayouts = layout.widgets.filter((widgetLayout) => visibleWidgetIds.includes(widgetLayout.id));
  const largeLayout = editableLayouts.map(toGridLayout);

  function handleLayoutChange(currentLayout: Layout) {
    if (!canEditLayout) return;

    const nextWidgets = currentLayout.map(fromGridLayout).filter((item): item is WidgetLayout => item !== null);
    if (nextWidgets.length > 0) {
      setLayout(nextWidgets);
    }
  }

  function handleMoveNarrowWidget(widgetId: WidgetId, direction: "up" | "down") {
    const currentIndex = visibleNarrowWidgetIds.indexOf(widgetId);
    if (currentIndex < 0) return;

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= visibleNarrowWidgetIds.length) return;

    const nextOrder = [...visibleNarrowWidgetIds];
    const currentId = nextOrder[currentIndex];
    nextOrder[currentIndex] = nextOrder[nextIndex];
    nextOrder[nextIndex] = currentId;

    // 기존 높이 값은 보존하되, narrow 스택에서는 높이를 사용하지 않음
    setNarrowLayout(nextOrder.map((id) => ({
      id,
      x: 0,
      y: 0,
      w: 1,
      h: layout.narrowWidgetHeights?.[id] ?? 5,
      minW: 1,
      minH: 3,
    })));
  }

  const gapClass = isCompact ? "space-y-4" : "space-y-6";

  return (
    <div ref={containerRef} className={gapClass}>
      <HeroWidget />
      {mounted ? (
        isNarrowLayout ? (
          // narrow/모바일: react-grid-layout 없이 단순 스택 → 콘텐츠 크기대로 자동 조절
          <div className={gapClass}>
            {visibleNarrowWidgetIds.map((id, index) => (
              <WidgetFrame
                key={id}
                id={id}
                title={widgetTitles[id]}
                isNarrow
                canMoveUp={isEditMode && index > 0}
                canMoveDown={isEditMode && index < visibleNarrowWidgetIds.length - 1}
                onMoveUp={isEditMode ? () => handleMoveNarrowWidget(id, "up") : undefined}
                onMoveDown={isEditMode ? () => handleMoveNarrowWidget(id, "down") : undefined}
              >
                {renderWidget(id, initialData)}
              </WidgetFrame>
            ))}
          </div>
        ) : (
          // 넓은 화면: react-grid-layout 그리드
          <Responsive
            className={`dashboard-grid ${isEditMode ? "dashboard-grid-edit" : ""}`}
            layouts={{ lg: largeLayout, sm: [] }}
            breakpoints={{ lg: 768, sm: 0 }}
            cols={{ lg: 12, sm: 1 }}
            rowHeight={72}
            margin={[24, 24]}
            containerPadding={[0, 0]}
            dragConfig={{ enabled: canEditLayout, handle: ".widget-drag-handle" }}
            resizeConfig={{ enabled: canEditLayout, handles: ["se"] }}
            width={width}
            onLayoutChange={handleLayoutChange}
          >
            {visibleWidgetIds.map((id) => (
              <div key={id}>
                <WidgetFrame
                  id={id}
                  title={widgetTitles[id]}
                >
                  {renderWidget(id, initialData)}
                </WidgetFrame>
              </div>
            ))}
          </Responsive>
        )
      ) : null}
      {visibleWidgetIds.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-500 shadow-soft">
          표시 중인 Dashboard 위젯이 없습니다. 설정에서 위젯을 다시 추가하세요.
        </div>
      ) : null}
    </div>
  );
}

function getNormalizedNarrowWidgetOrder(order: WidgetId[]) {
  const uniqueIds = order
    .filter((id) => editableWidgetIds.includes(id))
    .filter((id, index, ids) => ids.indexOf(id) === index);
  const missingIds = editableWidgetIds.filter((id) => !uniqueIds.includes(id));

  return [...uniqueIds, ...missingIds];
}
