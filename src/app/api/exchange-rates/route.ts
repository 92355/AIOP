import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_EXCHANGE_RATE_BASE,
  DEFAULT_EXCHANGE_RATE_QUOTE,
  EXCHANGE_RATE_PROVIDER,
  buildFrankfurterRateUrl,
  exchangeRateRowToResponse,
  isFreshExchangeRate,
  normalizeCurrency,
  parseFrankfurterRateResponse,
  type ExchangeRateRow,
} from "@/lib/exchangeRates";
import type { Currency } from "@/types";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  const url = new URL(request.url);
  const base = normalizeCurrency(url.searchParams.get("base"), DEFAULT_EXCHANGE_RATE_BASE);
  const quote = normalizeCurrency(url.searchParams.get("quote"), DEFAULT_EXCHANGE_RATE_QUOTE);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  if (base === quote) {
    const now = new Date().toISOString();
    return NextResponse.json({
      base,
      quote,
      rate: 1,
      rateDate: now.slice(0, 10),
      fetchedAt: now,
      provider: EXCHANGE_RATE_PROVIDER,
      source: "identity",
    });
  }

  const cachedRow = await getLatestCachedRate(supabase, base, quote);

  if (cachedRow && !forceRefresh && isFreshExchangeRate(cachedRow.fetched_at)) {
    return NextResponse.json(exchangeRateRowToResponse(cachedRow, "cache"));
  }

  try {
    const fetchedRate = await fetchLatestRate(base, quote);
    const fetchedAt = new Date().toISOString();

    const row = {
      base_currency: base,
      quote_currency: quote,
      rate: fetchedRate.rate,
      rate_date: fetchedRate.rateDate,
      provider: EXCHANGE_RATE_PROVIDER,
      fetched_at: fetchedAt,
    };

    const { error: upsertError } = await supabase
      .from("exchange_rates")
      .upsert(row, { onConflict: "base_currency,quote_currency,rate_date,provider" });

    if (upsertError) throw new Error(upsertError.message);

    return NextResponse.json(exchangeRateRowToResponse(row, "network"));
  } catch (error) {
    if (cachedRow) {
      return NextResponse.json(exchangeRateRowToResponse(cachedRow, "stale-cache"));
    }

    const message = error instanceof Error ? error.message : "환율을 가져오지 못했습니다.";
    return NextResponse.json({ message }, { status: 502 });
  }
}

async function getLatestCachedRate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: Currency,
  quote: Currency,
): Promise<ExchangeRateRow | null> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("base_currency, quote_currency, rate, rate_date, provider, fetched_at")
    .eq("base_currency", base)
    .eq("quote_currency", quote)
    .eq("provider", EXCHANGE_RATE_PROVIDER)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ExchangeRateRow | null) ?? null;
}

async function fetchLatestRate(base: Currency, quote: Currency) {
  const response = await fetch(buildFrankfurterRateUrl(base, quote), {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`환율 API 요청 실패: ${response.status}`);
  }

  return parseFrankfurterRateResponse(await response.json(), base, quote);
}
