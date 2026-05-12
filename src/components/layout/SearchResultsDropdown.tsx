"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { navItems, viewTitles } from "@/components/layout/navItems";
import { searchAllDomains, type SearchGroup, type SearchHit } from "@/lib/globalSearch";

type SearchResultsDropdownProps = {
  isOpen: boolean;
  query: string;
  onClose: () => void;
};

function highlightText(text: string, query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) return text;

  const before = text.slice(0, index);
  const matched = text.slice(index, index + normalizedQuery.length);
  const after = text.slice(index + normalizedQuery.length);

  return (
    <>
      {before}
      <mark className="rounded bg-emerald-400/20 px-0.5 text-emerald-200">{matched}</mark>
      {after}
    </>
  );
}

function truncateText(value: string, maxLength: number) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength)}...`;
}

export function SearchResultsDropdown({ isOpen, query, onClose }: SearchResultsDropdownProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const normalizedQuery = query.trim();
  const groups = useMemo(() => searchAllDomains(normalizedQuery, 3), [normalizedQuery]);
  const items = useMemo(
    () =>
      groups.flatMap((group) =>
        group.hits.map((hit) => ({
          key: `${group.domain}:${hit.id}`,
          group,
          hit,
        })),
      ),
    [groups],
  );
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) return;

    setActiveIndex(items.length > 0 ? 0 : -1);
  }, [isOpen, items.length]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      onClose();
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (items.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prevIndex) => (prevIndex <= 0 ? items.length - 1 : prevIndex - 1));
        return;
      }

      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        const selectedItem = items[activeIndex];
        if (!selectedItem) return;
        router.push(selectedItem.hit.href);
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isOpen, items, onClose, router]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-[calc(100%+8px)] z-[70] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-soft sm:w-[28rem]"
    >
      {groups.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
          <SearchIcon className="h-4 w-4" />
          검색 결과 없음
        </div>
      ) : (
        <div className="max-h-[24rem] overflow-y-auto p-2">
          {groups.map((group) => (
            <SearchGroupSection
              key={group.domain}
              group={group}
              query={normalizedQuery}
              activeIndex={activeIndex}
              items={items}
              onSelectHit={(hit) => {
                router.push(hit.href);
                onClose();
              }}
              onSelectGroup={() => {
                router.push(group.href);
                onClose();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchGroupSection({
  group,
  query,
  activeIndex,
  items,
  onSelectHit,
  onSelectGroup,
}: {
  group: SearchGroup;
  query: string;
  activeIndex: number;
  items: Array<{ key: string; group: SearchGroup; hit: SearchHit }>;
  onSelectHit: (hit: SearchHit) => void;
  onSelectGroup: () => void;
}) {
  const navItem = navItems.find((item) => item.key === group.viewKey);
  const Icon = navItem?.icon;

  return (
    <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-2">
      <button
        type="button"
        onClick={onSelectGroup}
        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-zinc-800/70"
      >
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-emerald-300" /> : null}
          <span className="text-sm font-medium text-zinc-100">{viewTitles[group.viewKey]}</span>
          <span className="text-xs text-zinc-500">{group.totalCount}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-zinc-500" />
      </button>
      <div className="mt-1 space-y-1">
        {group.hits.map((hit) => {
          const itemIndex = items.findIndex((item) => item.group.domain === group.domain && item.hit.id === hit.id);
          const isActive = itemIndex === activeIndex;
          return (
            <button
              key={hit.id}
              type="button"
              onClick={() => onSelectHit(hit)}
              className={`block w-full rounded-lg px-2 py-1.5 text-left transition ${
                isActive ? "bg-emerald-400/12" : "hover:bg-zinc-800/70"
              }`}
            >
              <p className="truncate text-sm font-medium text-zinc-100">{highlightText(truncateText(hit.title, 44), query)}</p>
              <p className="truncate text-xs text-zinc-500">{highlightText(truncateText(hit.snippet, 76), query)}</p>
            </button>
          );
        })}
      </div>
      {group.remainingCount > 0 ? (
        <button
          type="button"
          onClick={onSelectGroup}
          className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200"
        >
          외 {group.remainingCount}개 더 보기
        </button>
      ) : null}
    </section>
  );
}
