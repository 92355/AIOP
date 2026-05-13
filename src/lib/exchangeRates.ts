import type { Currency } from "@/types";

export const EXCHANGE_RATE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
export const EXCHANGE_RATE_MANUAL_REFRESH_COOLDOWN_MS = 3 * 60 * 60 * 1000;
export const EXCHANGE_RATE_PROVIDER = "frankfurter";
export const DEFAULT_EXCHANGE_RATE_BASE: Currency = "USD";
export const DEFAULT_EXCHANGE_RATE_QUOTE: Currency = "KRW";

export type ExchangeRateSource = "cache" | "network" | "stale-cache" | "identity";

export type ExchangeRateResponse = {
  base: Currency;
  quote: Currency;
  rate: number;
  rateDate: string;
  fetchedAt: string;
  provider: typeof EXCHANGE_RATE_PROVIDER;
  source: ExchangeRateSource;
};

export type ExchangeRateRow = {
  base_currency: Currency;
  quote_currency: Currency;
  rate: number | string;
  rate_date: string;
  provider: string;
  fetched_at: string;
};

type FrankfurterRateResponse = {
  date?: unknown;
  base?: unknown;
  quote?: unknown;
  rate?: unknown;
};

const supportedCurrencies: Currency[] = ["KRW", "USD"];

export function isSupportedCurrency(value: string): value is Currency {
  return supportedCurrencies.includes(value as Currency);
}

export function normalizeCurrency(value: string | null, fallback: Currency): Currency {
  if (!value) return fallback;

  const upperValue = value.trim().toUpperCase();
  return isSupportedCurrency(upperValue) ? upperValue : fallback;
}

export function isFreshExchangeRate(fetchedAt: string, now = Date.now()) {
  const fetchedTime = new Date(fetchedAt).getTime();
  if (!Number.isFinite(fetchedTime)) return false;

  return now - fetchedTime < EXCHANGE_RATE_CACHE_TTL_MS;
}

export function getManualRefreshCooldownRemainingMs(fetchedAt: string, now = Date.now()) {
  const fetchedTime = new Date(fetchedAt).getTime();
  if (!Number.isFinite(fetchedTime)) return 0;

  return Math.max(0, fetchedTime + EXCHANGE_RATE_MANUAL_REFRESH_COOLDOWN_MS - now);
}

export function exchangeRateRowToResponse(row: ExchangeRateRow, source: ExchangeRateSource): ExchangeRateResponse {
  return {
    base: row.base_currency,
    quote: row.quote_currency,
    rate: Number(row.rate),
    rateDate: row.rate_date,
    fetchedAt: row.fetched_at,
    provider: EXCHANGE_RATE_PROVIDER,
    source,
  };
}

export function parseFrankfurterRateResponse(value: unknown, base: Currency, quote: Currency): { rate: number; rateDate: string } {
  if (!value || typeof value !== "object") {
    throw new Error("환율 API 응답이 올바르지 않습니다.");
  }

  const response = value as FrankfurterRateResponse;
  const rate = typeof response.rate === "number" ? response.rate : Number(response.rate);
  const rateDate = typeof response.date === "string" ? response.date : "";
  const responseBase = typeof response.base === "string" ? response.base.toUpperCase() : "";
  const responseQuote = typeof response.quote === "string" ? response.quote.toUpperCase() : "";

  if (responseBase !== base || responseQuote !== quote || !Number.isFinite(rate) || rate <= 0 || rateDate.length === 0) {
    throw new Error("환율 API 응답 값이 올바르지 않습니다.");
  }

  return { rate, rateDate };
}

export function buildFrankfurterRateUrl(base: Currency, quote: Currency) {
  return `https://api.frankfurter.dev/v2/rate/${base}/${quote}`;
}
