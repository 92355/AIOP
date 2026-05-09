export function calculateRequiredCapital(price: number, expectedYield: number) {
  if (expectedYield <= 0) return 0;
  return price / (expectedYield / 100);
}

export function calculateMonthsToBuy(price: number, monthlyInvestment: number) {
  if (monthlyInvestment <= 0) return 0;
  return price / monthlyInvestment;
}

export function calculateMonthlyCashflowNeeded(price: number, targetMonths: number) {
  if (targetMonths <= 0) return 0;
  return price / targetMonths;
}

export function calculateAssetPlan(
  price: number,
  targetMonths: number,
  expectedYield: number,
  monthlyInvestment: number,
) {
  return {
    requiredCapital: calculateRequiredCapital(price, expectedYield),
    monthlyCashflowNeeded: calculateMonthlyCashflowNeeded(price, targetMonths),
    monthsToBuy: calculateMonthsToBuy(price, monthlyInvestment),
  };
}
