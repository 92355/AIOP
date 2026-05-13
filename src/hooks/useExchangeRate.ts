"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_EXCHANGE_RATE_BASE,
  DEFAULT_EXCHANGE_RATE_QUOTE,
  type ExchangeRateResponse,
} from "@/lib/exchangeRates";
import type { Currency } from "@/types";

type ExchangeRateState = {
  data: ExchangeRateResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useExchangeRate(base: Currency = DEFAULT_EXCHANGE_RATE_BASE, quote: Currency = DEFAULT_EXCHANGE_RATE_QUOTE) {
  const [state, setState] = useState<ExchangeRateState>({
    data: null,
    isLoading: true,
    errorMessage: null,
  });

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
      } catch (error) {
        setState((currentState) => ({
          ...currentState,
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : "환율 정보를 가져오지 못했습니다.",
        }));
      }
    },
    [base, quote],
  );

  useEffect(() => {
    void loadExchangeRate(false);
  }, [loadExchangeRate]);

  return {
    ...state,
    refresh: () => loadExchangeRate(true),
  };
}
