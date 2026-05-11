import {
  BarChart3,
  BookOpen,
  Calculator,
  CreditCard,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { NavItem, ViewKey } from "@/types";

export const viewTitles: Record<ViewKey, string> = {
  dashboard: "대시보드",
  wants: "구매 목표",
  calculator: "자산 구매 계산기",
  regret: "후회 기록장",
  subscriptions: "구독 관리",
  insights: "인사이트 보관함",
  notes: "노트 / 수집함",
};

export const navItems: NavItem[] = [
  { key: "dashboard", label: viewTitles.dashboard, icon: BarChart3 },
  { key: "wants", label: viewTitles.wants, icon: Sparkles },
  { key: "calculator", label: "계산기", icon: Calculator },
  { key: "regret", label: "후회", icon: TrendingUp },
  { key: "subscriptions", label: "구독", icon: CreditCard },
  { key: "insights", label: "인사이트", icon: BookOpen },
  { key: "notes", label: "노트", icon: Inbox },
];
