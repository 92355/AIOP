"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_EXCHANGE_RATE_BASE,
  DEFAULT_EXCHANGE_RATE_QUOTE,
  EXCHANGE_RATE_MANUAL_REFRESH_COOLDOWN_MS,
  type ExchangeRateResponse,
} from "@/lib/exchangeRates";
import type { Currency } from "@/types";

type ExchangeRateState = {
  data: ExchangeRateResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
};

function getManualRefreshStorageKey(base: Currency, quote: Currency) {
  return `aiop:exchange-rate-refresh:${base}:${quote}`;
}

function readLastManualRefreshAt(base: Currency, quote: Currency) {
  if (typeof window === "undefined") return 0;

  const rawValue = window.localStorage.getItem(getManualRefreshStorageKey(base, quote));
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

function writeLastManualRefreshAt(base: Currency, quote: Currency, timestamp: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getManualRefreshStorageKey(base, quote), String(timestamp));
}

export function useExchangeRate(base: Currency = DEFAULT_EXCHANGE_RATE_BASE, quote: Currency = DEFAULT_EXCHANGE_RATE_QUOTE) {
  const [state, setState] = useState<ExchangeRateState>({
    data: null,
    isLoading: true,
    errorMessage: null,
  });
  const [lastManualRefreshAt, setLastManualRefreshAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setLastManualRefreshAt(readLastManualRefreshAt(base, quote));
  }, [base, quote]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadExchangeRate = useCallback(
    async (forceRefresh = false) => {
      setState((currentState) => ({
        ...currentState,
        isLoading: true,
        errorMessage: null,
      }));

      try {
        const params = new URLSearchParams({ base, quote });
        if (forceRefresh) params.set("refresh", "1");

        const response = await fetch(`/api/exchange-rates?${params.toString()}`, {
          headers: {
            accept: "application/json",
          },
        });
        const payload = (await response.json()) as ExchangeRateResponse | { message?: string };

        if (!response.ok) {
          throw new Error("message" in payload && payload.message ? payload.message : "환율 정보를 가져오지 못했습니다.");
        }

        setState({
          data: payload as ExchangeRateResponse,
          isLoading: false,
          errorMessage: null,
        });
        return true;
      } catch (error) {
        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : "환율 정보를 가져오지 못했습니다.",
        }));
        return false;
      }
    },
    [base, quote],
  );

  const refresh = useCallback(async () => {
    const refreshAt = Date.now();
    const cooldownEndTime = lastManualRefreshAt + EXCHANGE_RATE_MANUAL_REFRESH_COOLDOWN_MS;
    if (cooldownEndTime > refreshAt) return;

    const hasSucceeded = await loadExchangeRate(true);
    if (!hasSucceeded) return;

    writeLastManualRefreshAt(base, quote, refreshAt);
    setLastManualRefreshAt(refreshAt);
  }, [base, lastManualRefreshAt, loadExchangeRate, quote]);

  const cooldownEndTime = lastManualRefreshAt + EXCHANGE_RATE_MANUAL_REFRESH_COOLDOWN_MS;
  const cooldownRemainingMs = Math.max(0, cooldownEndTime - now);

  useEffect(() => {
    void loadExchangeRate(false);
  }, [loadExchangeRate]);

  return {
    ...state,
    refresh,
    canManualRefresh: cooldownRemainingMs <= 0,
    cooldownRemainingMs,
  };
}
