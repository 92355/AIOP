import type { KptRetro, RetroItem, TodoItem } from "@/types";

export type WeeklyRollup = {
  weekStart: string;
  weekEnd: string;
  daysWritten: number;
  totalTry: number;
  doneTry: number;
  completionRate: number;
  problemKeywords: Array<{ word: string; count: number }>;
  daily: Array<{
    date: string;
    weekday: string;
    retro: KptRetro | null;
  }>;
};

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const ignoredProblemWords = new Set([
  "그리고",
  "하지만",
  "그래서",
  "오늘",
  "내일",
  "이번",
  "너무",
  "있는",
  "없는",
  "하기",
  "것이",
  "that",
  "with",
  "this",
  "from",
  "and",
  "the",
]);

export function createTodoFromTry(text: string): TodoItem {
  return {
    id: createId(),
    title: text,
    status: "todo",
    priority: "medium",
    createdAt: formatCreatedAt(new Date()),
  };
}

export function syncTryWithTodos(retros: KptRetro[], todos: TodoItem[]): KptRetro[] {
  const todoById = new Map(todos.map((todo) => [todo.id, todo]));

  return retros.map((retro) => ({
    ...retro,
    try: retro.try.map((item) => {
      if (!item.linkedTodoId) return item;

      const linkedTodo = todoById.get(item.linkedTodoId);
      if (!linkedTodo) {
        return {
          ...item,
          linkedTodoId: undefined,
        };
      }

      return {
        ...item,
        done: linkedTodo.status === "done",
      };
    }),
  }));
}

export function findPreviousRetro(retros: KptRetro[], today: string): KptRetro | null {
  return (
    retros
      .filter((retro) => retro.date < today && hasRetroContent(retro))
      .sort((left, right) => right.date.localeCompare(left.date))[0] ?? null
  );
}

export function getUnfinishedTryItems(retro: KptRetro | null): RetroItem[] {
  if (!retro) return [];
  return retro.try.filter((item) => !item.done);
}

export function carryOverTryItems(items: RetroItem[]): RetroItem[] {
  return items.map((item) => ({
    id: createId(),
    text: item.text,
    done: false,
    carriedFrom: item.id,
  }));
}

export function calculateStreak(retros: KptRetro[], today: string): number {
  const writtenDates = new Set(retros.filter(hasRetroContent).map((retro) => retro.date));
  let cursor = parseLocalDate(today);
  let streak = 0;

  while (writtenDates.has(formatLocalDate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function getWeekProgress(retros: KptRetro[], today: string): { written: number; total: 7 } {
  const range = getWeekRange(parseLocalDate(today));
  const writtenDates = new Set(retros.filter(hasRetroContent).map((retro) => retro.date));

  return {
    written: range.days.filter((date) => writtenDates.has(date)).length,
    total: 7,
  };
}

export function getWeekRange(date: Date): { start: Date; end: Date; days: string[] } {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = localDate.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const start = addDays(localDate, -daysSinceMonday);
  const end = addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, index) => formatLocalDate(addDays(start, index)));

  return { start, end, days };
}

export function buildWeeklyRollup(retros: KptRetro[], weekStart: Date): WeeklyRollup {
  const range = getWeekRange(weekStart);
  const retroByDate = new Map(retros.map((retro) => [retro.date, retro]));
  const weekRetros = range.days.map((date) => retroByDate.get(date) ?? null);
  const writtenRetros = weekRetros.filter((retro): retro is KptRetro => retro !== null && hasRetroContent(retro));
  const totalTry = writtenRetros.reduce((sum, retro) => sum + retro.try.length, 0);
  const doneTry = writtenRetros.reduce((sum, retro) => sum + retro.try.filter((item) => item.done).length, 0);

  return {
    weekStart: formatLocalDate(range.start),
    weekEnd: formatLocalDate(range.end),
    daysWritten: writtenRetros.length,
    totalTry,
    doneTry,
    completionRate: totalTry > 0 ? doneTry / totalTry : 0,
    problemKeywords: extractProblemKeywords(writtenRetros, 3),
    daily: range.days.map((date) => ({
      date,
      weekday: formatWeekday(parseLocalDate(date)),
      retro: retroByDate.get(date) ?? null,
    })),
  };
}

export function extractProblemKeywords(retros: KptRetro[], topN: number): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();

  retros
    .flatMap((retro) => retro.problem)
    .flatMap((item) => tokenizeProblemText(item.text))
    .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

export function hasRetroContent(retro: KptRetro): boolean {
  return retro.keep.length > 0 || retro.problem.length > 0 || retro.try.length > 0;
}

export function createEmptyRetro(date: string): KptRetro {
  const now = new Date().toISOString();

  return {
    id: `retro-${date}`,
    date,
    keep: [],
    problem: [],
    try: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function sortRetrosByDateDesc(left: KptRetro, right: KptRetro): number {
  return right.date.localeCompare(left.date);
}

export function getLocalDateString(date: Date): string {
  return formatLocalDate(date);
}

export function formatDateLabel(value: string): string {
  const date = parseLocalDate(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(date);
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * millisecondsPerDay);
}

export function createId(): string {
  return crypto.randomUUID?.() ?? Date.now().toString();
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCreatedAt(date: Date): string {
  return `오늘 ${date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
}

function tokenizeProblemText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !ignoredProblemWords.has(word));
}
