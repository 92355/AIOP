import {
  normalizeInsights,
  normalizeNotes,
  normalizeRegretItems,
  normalizeSubscriptions,
  normalizeTodos,
  normalizeWants,
} from "@/lib/storageNormalizers";

const STORAGE_KEYS = {
  wants: "aiop:wants",
  subscriptions: "aiop:subscriptions",
  insights: "aiop:insights",
  notes: "aiop:notes",
  regretItems: "aiop:regret-items",
  todos: "aiop:todos",
  layout: "aiop:layout",
  heroMessage: "aiop:hero-message",
  compactMode: "aiop-compact-mode",
  themeMode: "aiop-theme-mode",
} as const;

const EXPORT_VERSION = 1;

export type AiopExportPayload = {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  data: {
    wants: unknown;
    subscriptions: unknown;
    insights: unknown;
    notes: unknown;
    regretItems: unknown;
    todos: unknown;
    layout: unknown;
    heroMessage: unknown;
    compactMode: unknown;
    themeMode: unknown;
  };
};

function readKey(key: string): unknown {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch (error) {
    console.warn(`Failed to read localStorage key: ${key}`, error);
    return null;
  }
}

function writeKey(key: string, value: unknown) {
  if (typeof window === "undefined") return;

  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error);
  }
}

export function buildExportPayload(): AiopExportPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      wants: readKey(STORAGE_KEYS.wants),
      subscriptions: readKey(STORAGE_KEYS.subscriptions),
      insights: readKey(STORAGE_KEYS.insights),
      notes: readKey(STORAGE_KEYS.notes),
      regretItems: readKey(STORAGE_KEYS.regretItems),
      todos: readKey(STORAGE_KEYS.todos),
      layout: readKey(STORAGE_KEYS.layout),
      heroMessage: readKey(STORAGE_KEYS.heroMessage),
      compactMode: readKey(STORAGE_KEYS.compactMode),
      themeMode: readKey(STORAGE_KEYS.themeMode),
    },
  };
}

export function downloadExport() {
  if (typeof window === "undefined") return;

  const payload = buildExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  const stamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 8);

  anchor.href = url;
  anchor.download = `aiop-export-${stamp}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export type ImportResult = {
  ok: boolean;
  message: string;
  counts?: {
    wants: number;
    subscriptions: number;
    insights: number;
    notes: number;
    regretItems: number;
    todos: number;
  };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePayload(raw: string): AiopExportPayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return null;
    if (parsed.version !== EXPORT_VERSION) return null;
    if (!isObject(parsed.data)) return null;

    return {
      version: EXPORT_VERSION,
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      data: {
        wants: parsed.data.wants,
        subscriptions: parsed.data.subscriptions,
        insights: parsed.data.insights,
        notes: parsed.data.notes,
        regretItems: parsed.data.regretItems,
        todos: parsed.data.todos,
        layout: parsed.data.layout,
        heroMessage: parsed.data.heroMessage,
        compactMode: parsed.data.compactMode,
        themeMode: parsed.data.themeMode,
      },
    };
  } catch (error) {
    console.warn("Failed to parse AIOP export payload", error);
    return null;
  }
}

// 도메인 데이터: normalizer로 거른 결과만 저장 / domain data: store normalizer output
// 환경 키 (heroMessage, compactMode, themeMode, layout): 타입 가드 후 그대로 저장
export function applyImport(raw: string): ImportResult {
  const payload = parsePayload(raw);

  if (!payload) {
    return {
      ok: false,
      message: "올바른 AIOP 백업 파일이 아닙니다. version 1 JSON 파일인지 확인하세요.",
    };
  }

  const wants = normalizeWants(payload.data.wants);
  const subscriptions = normalizeSubscriptions(payload.data.subscriptions);
  const insights = normalizeInsights(payload.data.insights);
  const notes = normalizeNotes(payload.data.notes);
  const regretItems = normalizeRegretItems(payload.data.regretItems);
  const todos = normalizeTodos(payload.data.todos);

  writeKey(STORAGE_KEYS.wants, wants);
  writeKey(STORAGE_KEYS.subscriptions, subscriptions);
  writeKey(STORAGE_KEYS.insights, insights);
  writeKey(STORAGE_KEYS.notes, notes);
  writeKey(STORAGE_KEYS.regretItems, regretItems);
  writeKey(STORAGE_KEYS.todos, todos);

  if (isObject(payload.data.layout)) {
    writeKey(STORAGE_KEYS.layout, payload.data.layout);
  }

  if (typeof payload.data.heroMessage === "string") {
    writeKey(STORAGE_KEYS.heroMessage, payload.data.heroMessage);
  }

  if (typeof payload.data.compactMode === "boolean") {
    writeKey(STORAGE_KEYS.compactMode, payload.data.compactMode);
  }

  if (payload.data.themeMode === "light" || payload.data.themeMode === "dark") {
    writeKey(STORAGE_KEYS.themeMode, payload.data.themeMode);
  }

  return {
    ok: true,
    message: "백업을 복원했습니다. 페이지를 새로고침합니다.",
    counts: {
      wants: wants.length,
      subscriptions: subscriptions.length,
      insights: insights.length,
      notes: notes.length,
      regretItems: regretItems.length,
      todos: todos.length,
    },
  };
}
