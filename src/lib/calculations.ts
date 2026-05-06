export function formatKRW(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactKRW(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${Math.round(value / 10000).toLocaleString("ko-KR")}만`;
  return value.toLocaleString("ko-KR");
}

export function calculateRequiredCapital(price: number, expectedYield: number) {
  if (expectedYield <= 0) return 0;
  return price / (expectedYield / 100);
}

export function calculateAssetPlan(
  price: number,
  targetMonths: number,
  expectedYield: number,
  monthlyInvestment: number,
) {
  return {
    requiredCapital: calculateRequiredCapital(price, expectedYield),
    monthlyCashflowNeeded: targetMonths > 0 ? price / targetMonths : 0,
    monthsToBuy: monthlyInvestment > 0 ? price / monthlyInvestment : 0,
  };
}
