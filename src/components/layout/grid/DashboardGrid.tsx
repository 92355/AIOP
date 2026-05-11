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
import type { ViewKey } from "@/types";
import type { WidgetId, WidgetLayout } from "@/types/layout";

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

function toNarrowGridLayouts(layout: WidgetLayout): LayoutItem {
  return {
    x: 0,
    y: layout.y,
    w: 1,
    h: layout.h,
    i: layout.id,
    minW: 1,
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

type DashboardGridProps = {
  onSelectView: (view: ViewKey) => void;
};

function renderWidget(id: WidgetId, onSelectView: (view: ViewKey) => void) {
  switch (id) {
    case "hero":
      return <HeroWidget />;
    case "summary-cards":
      return <SummaryCards onSelectView={onSelectView} />;
    case "want-preview":
      return <WantPreview />;
    case "asset-snapshot":
      return <AssetSnapshot />;
    case "subscription-summary":
      return <SubscriptionSummary />;
    case "recent-insights":
      return <RecentInsights />;
    case "todo-summary":
      return <TodoSummary />;
  }
}

export function DashboardGrid({ onSelectView }: DashboardGridProps) {
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
  const narrowLayout = getNarrowLayout(
    visibleNarrowWidgetIds,
    layout.narrowWidgetHeights ?? {},
  );

  function handleLayoutChange(currentLayout: Layout) {
    if (!canEditLayout) return;

    const nextWidgets = currentLayout.map(fromGridLayout).filter((item): item is WidgetLayout => item !== null);
    if (nextWidgets.length > 0) {
      if (isNarrowLayout) {
        setNarrowLayout(sortLayoutByPosition(nextWidgets));
        return;
      }

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
    setNarrowLayout(getNarrowLayout(nextOrder, layout.narrowWidgetHeights ?? {}).map(fromNarrowLayout));
  }

  return (
    <div ref={containerRef} className={isCompact ? "space-y-4" : "space-y-6"}>
      <HeroWidget />
      {mounted ? (
        <Responsive
          className={`dashboard-grid ${isEditMode ? "dashboard-grid-edit" : ""}`}
          layouts={{
            lg: largeLayout,
            sm: narrowLayout,
          }}
          breakpoints={{ lg: 768, sm: 0 }}
          cols={{ lg: 12, sm: 1 }}
          rowHeight={72}
          margin={isCompact ? [0, 16] : [24, 24]}
          containerPadding={[0, 0]}
          dragConfig={{ enabled: canEditLayout, handle: ".widget-drag-handle" }}
          resizeConfig={{ enabled: canEditLayout, handles: ["se"] }}
          width={width}
          onLayoutChange={handleLayoutChange}
        >
          {visibleWidgetIds.map((id) => {
            const narrowIndex = visibleNarrowWidgetIds.indexOf(id);

            return (
            <div key={id}>
              <WidgetFrame
                id={id}
                title={widgetTitles[id]}
                canMoveUp={isNarrowLayout && narrowIndex > 0}
                canMoveDown={isNarrowLayout && narrowIndex >= 0 && narrowIndex < visibleNarrowWidgetIds.length - 1}
                onMoveUp={isNarrowLayout ? () => handleMoveNarrowWidget(id, "up") : undefined}
                onMoveDown={isNarrowLayout ? () => handleMoveNarrowWidget(id, "down") : undefined}
              >
                {renderWidget(id, onSelectView)}
              </WidgetFrame>
            </div>
            );
          })}
        </Responsive>
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

function getNarrowLayout(order: WidgetId[], heights: Partial<Record<WidgetId, number>>) {
  let currentY = 0;

  return order.map((id) => {
    const height = heights[id] ?? 5;
    const layout = toNarrowGridLayouts({
      id,
      x: 0,
      y: currentY,
      w: 1,
      h: height,
      minW: 1,
      minH: 3,
    });

    currentY += height;
    return layout;
  });
}

function fromNarrowLayout(layout: LayoutItem): WidgetLayout {
  return {
    id: layout.i as WidgetId,
    x: 0,
    y: layout.y,
    w: 1,
    h: layout.h,
    minW: layout.minW,
    minH: layout.minH,
  };
}

function sortLayoutByPosition(items: WidgetLayout[]) {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.y !== secondItem.y) {
      return firstItem.y - secondItem.y;
    }

    return firstItem.x - secondItem.x;
  });
}
