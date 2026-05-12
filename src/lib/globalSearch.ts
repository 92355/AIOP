import type { Insight, KptRetro, Note, Subscription, TodoItem, ViewKey, WantItem } from "@/types";

export type SearchDomain = "wants" | "subscriptions" | "insights" | "notes" | "todos" | "retros";

export type SearchHit = {
  domain: SearchDomain;
  id: string;
  title: string;
  snippet: string;
  href: string;
};

export type SearchGroup = {
  domain: SearchDomain;
  viewKey: ViewKey;
  href: string;
  totalCount: number;
  remainingCount: number;
  hits: SearchHit[];
};

export type SearchData = {
  wants: WantItem[];
  subscriptions: Subscription[];
  insights: Insight[];
  notes: Note[];
  todos: TodoItem[];
  retros: KptRetro[];
};

const GROUP_META: Record<SearchDomain, { viewKey: ViewKey; href: string }> = {
  wants: { viewKey: "wants", href: "/wants" },
  subscriptions: { viewKey: "subscriptions", href: "/subscriptions" },
  insights: { viewKey: "insights", href: "/insights" },
  notes: { viewKey: "notes", href: "/notes" },
  todos: { viewKey: "todos", href: "/todos" },
  retros: { viewKey: "retros", href: "/retros" },
};

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function getSearchableText(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function createHit(domain: SearchDomain, id: string, title: string, snippet: string, href: string): SearchHit {
  return {
    domain,
    id,
    title,
    snippet,
    href,
  };
}

function searchWants(items: WantItem[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) => getSearchableText([item.name, item.reason, item.category, item.status, item.priority]).includes(searchTerm))
    .map((item) => createHit("wants", item.id, item.name, item.reason, "/wants"));
}

function searchSubscriptions(items: Subscription[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) => getSearchableText([item.service, item.category]).includes(searchTerm))
    .map((item) => createHit("subscriptions", item.id, item.service, item.category, "/subscriptions"));
}

function searchInsights(items: Insight[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) =>
      getSearchableText([item.title, item.keySentence, item.actionItem, item.relatedGoal, ...item.tags]).includes(searchTerm),
    )
    .map((item) => createHit("insights", item.id, item.title, item.keySentence, "/insights"));
}

function getNoteTitle(item: Note) {
  if (item.title && item.title.trim().length > 0) return item.title.trim();
  const firstLine = item.body.split("\n")[0]?.trim() ?? "";
  if (firstLine.length === 0) return "제목 없는 노트";
  return firstLine.length > 36 ? `${firstLine.slice(0, 36)}...` : firstLine;
}

function searchNotes(items: Note[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) => getSearchableText([item.title, item.body, ...item.tags]).includes(searchTerm))
    .map((item) => createHit("notes", item.id, getNoteTitle(item), item.body, "/notes"));
}

function searchTodos(items: TodoItem[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) => getSearchableText([item.title, item.memo]).includes(searchTerm))
    .map((item) => createHit("todos", item.id, item.title, item.memo ?? "", "/todos"));
}

function searchRetros(items: KptRetro[], searchTerm: string): SearchHit[] {
  return items
    .filter((item) =>
      getSearchableText([item.date, ...item.keep.map((entry) => entry.text), ...item.problem.map((entry) => entry.text), ...item.try.map((entry) => entry.text)]).includes(searchTerm),
    )
    .map((item) =>
      createHit(
        "retros",
        item.id,
        `${item.date} 회고`,
        [...item.keep.map((entry) => entry.text), ...item.problem.map((entry) => entry.text), ...item.try.map((entry) => entry.text)]
          .filter((entry) => entry.trim().length > 0)
          .join(" / "),
        "/retros",
      ),
    );
}

export function searchAllDomains(data: SearchData, query: string, maxPerDomain = 3): SearchGroup[] {
  const searchTerm = normalizeSearchTerm(query);
  if (searchTerm.length < 1) return [];

  const allHits: Record<SearchDomain, SearchHit[]> = {
    wants: searchWants(data.wants, searchTerm),
    subscriptions: searchSubscriptions(data.subscriptions, searchTerm),
    insights: searchInsights(data.insights, searchTerm),
    notes: searchNotes(data.notes, searchTerm),
    todos: searchTodos(data.todos, searchTerm),
    retros: searchRetros(data.retros, searchTerm),
  };

  return (Object.keys(allHits) as SearchDomain[])
    .map((domain) => {
      const hits = allHits[domain];
      const totalCount = hits.length;
      if (totalCount === 0) return null;

      const limitedHits = hits.slice(0, maxPerDomain);
      const { href, viewKey } = GROUP_META[domain];

      return {
        domain,
        viewKey,
        href,
        totalCount,
        remainingCount: Math.max(0, totalCount - limitedHits.length),
        hits: limitedHits,
      } satisfies SearchGroup;
    })
    .filter((group): group is SearchGroup => group !== null);
}
