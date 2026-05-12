import {
  BarChart3,
  BookOpen,
  Calculator,
  CheckSquare,
  CreditCard,
  Inbox,
  NotebookPen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { NavItem, ViewKey } from "@/types";

export const viewTitles: Record<ViewKey, string> = {
  dashboard: "대시보드",
  wants: "구매 목표",
  calculator: "자산 구매 계산기",
  regret: "그때 살걸 기록장",
  subscriptions: "구독 관리",
  insights: "인사이트 보관함",
  notes: "노트 / 수집함",
  todos: "Todo",
  retros: "K.P.T 회고",
};

export const navItems: NavItem[] = [
  { key: "dashboard", label: viewTitles.dashboard, icon: BarChart3, href: "/" },
  { key: "wants", label: viewTitles.wants, icon: Sparkles, href: "/wants" },
  { key: "calculator", label: "계산기", icon: Calculator, href: "/calculator" },
  { key: "regret", label: "후회 기록", icon: TrendingUp, href: "/regret" },
  { key: "subscriptions", label: "구독", icon: CreditCard, href: "/subscriptions" },
  { key: "insights", label: "인사이트", icon: BookOpen, href: "/insights" },
  { key: "notes", label: "노트", icon: Inbox, href: "/notes" },
  { key: "todos", label: "Todo", icon: CheckSquare, href: "/todos" },
  { key: "retros", label: "K.P.T", icon: NotebookPen, href: "/retros" },
];

export function isDashboardPathname(pathname: string) {
  return pathname === "/";
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.href === "/") {
    return isDashboardPathname(pathname);
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getActiveNavItem(pathname: string) {
  return navItems.find((item) => isNavItemActive(pathname, item)) ?? navItems[0];
}

export function getViewKeyFromPathname(pathname: string): ViewKey {
  return getActiveNavItem(pathname).key;
}
