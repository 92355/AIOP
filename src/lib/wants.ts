import type { WantItem, WantPriority, WantStatus } from "@/types";

const PRIORITY_SCORE: Record<WantPriority, number> = {
  low: 8,
  medium: 16,
  high: 24,
};

const STATUS_SCORE: Record<WantStatus, number> = {
  thinking: 4,
  planned: 12,
  bought: 0,
  skipped: -8,
};

export function calculateWantDecisionScore(item: Pick<WantItem, "price" | "priority" | "status" | "targetMonths" | "monthlyCashflowNeeded" | "reason">) {
  const priorityScore = item.priority ? PRIORITY_SCORE[item.priority] : PRIORITY_SCORE.medium;
  const statusScore = STATUS_SCORE[item.status];
  const targetMonths = Math.max(1, item.targetMonths ?? 12);
  const monthlyCashflowNeeded = Math.max(0, item.monthlyCashflowNeeded ?? 0);
  const reasonBonus = item.reason.trim().length >= 20 ? 6 : 0;

  let score = 50 + priorityScore + statusScore + reasonBonus;

  if (targetMonths <= 3) score += 18;
  else if (targetMonths <= 6) score += 12;
  else if (targetMonths <= 12) score += 6;
  else score -= 4;

  if (monthlyCashflowNeeded <= 0) score -= 8;
  else if (monthlyCashflowNeeded <= 200000) score += 10;
  else if (monthlyCashflowNeeded <= 500000) score += 6;
  else if (monthlyCashflowNeeded <= 1000000) score += 2;
  else score -= 8;

  if (item.price >= 10000000) score -= 8;
  else if (item.price >= 3000000) score -= 3;
  else score += 4;

  return clampScore(score);
}

export function getWantScoreLabel(score: number) {
  if (score >= 80) return "진행";
  if (score >= 65) return "검토";
  if (score >= 50) return "신중";
  return "보류";
}

function clampScore(score: number) {
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score);
}
