import type { Insight, Note, RegretItem, Subscription, WantItem } from "@/types";

export const wants: WantItem[] = [
  {
    id: "want-1",
    name: "MacBook Pro 16",
    price: 3500000,
    category: "Productivity",
    reason: "개발과 디자인 작업을 한 장비에서 안정적으로 처리하기 위해",
    status: "planned",
    score: 82,
    requiredCapital: 87500000,
    targetDate: "2026-11-30",
  },
  {
    id: "want-2",
    name: "Standing Desk",
    price: 780000,
    category: "Lifestyle",
    reason: "장시간 작업 루틴의 피로도를 낮추기 위해",
    status: "thinking",
    score: 74,
    requiredCapital: 19500000,
    targetDate: "2026-08-15",
  },
  {
    id: "want-3",
    name: "BTC DCA Budget",
    price: 1200000,
    category: "Investment",
    reason: "월별 자산 배분 실험을 작게 시작하기 위해",
    status: "planned",
    score: 68,
    requiredCapital: 30000000,
    targetDate: "2026-07-01",
  },
  {
    id: "want-4",
    name: "Mirrorless Camera",
    price: 2100000,
    category: "Hobby",
    reason: "여행과 프로젝트 기록의 퀄리티를 높이기 위해",
    status: "thinking",
    score: 61,
    requiredCapital: 52500000,
    targetDate: "2027-01-10",
  },
  {
    id: "want-5",
    name: "Ergonomic Chair",
    price: 1450000,
    category: "Productivity",
    reason: "매일 쓰는 작업 환경의 기본 체력을 개선하기 위해",
    status: "planned",
    score: 88,
    requiredCapital: 36250000,
    targetDate: "2026-09-05",
  },
];

export const subscriptions: Subscription[] = [
  { id: "sub-1", service: "ChatGPT Plus", monthlyPrice: 29000, category: "AI", usage: "daily", valueScore: 96, status: "keep" },
  { id: "sub-2", service: "Netflix", monthlyPrice: 17000, category: "Entertainment", usage: "weekly", valueScore: 58, status: "review" },
  { id: "sub-3", service: "Spotify", monthlyPrice: 11900, category: "Music", usage: "daily", valueScore: 84, status: "keep" },
  { id: "sub-4", service: "Notion", monthlyPrice: 12000, category: "Productivity", usage: "weekly", valueScore: 71, status: "keep" },
  { id: "sub-5", service: "Cursor", monthlyPrice: 29000, category: "Development", usage: "daily", valueScore: 91, status: "keep" },
  { id: "sub-6", service: "iCloud", monthlyPrice: 3300, category: "Storage", usage: "monthly", valueScore: 64, status: "review" },
];

export const regrets: RegretItem[] = [
  { id: "regret-1", name: "NVDA", oldPrice: 420000, currentPrice: 1270000, changeRate: 202.3, memo: "AI 인프라 수요를 봤지만 실행하지 못함", thoughtThen: "이미 많이 오른 것 같다", resultNow: "관심은 맞았고 기준이 부족했다" },
  { id: "regret-2", name: "BTC", oldPrice: 38000000, currentPrice: 92000000, changeRate: 142.1, memo: "분할 매수 원칙 없이 가격만 바라봄", thoughtThen: "더 내려오면 사자", resultNow: "계획 없는 대기는 기회비용이 컸다" },
  { id: "regret-3", name: "Apple Vision Pro", oldPrice: 4700000, currentPrice: 3900000, changeRate: -17.0, memo: "초기 제품은 경험 욕구와 효용을 분리해야 함", thoughtThen: "새로운 컴퓨팅을 빨리 경험하고 싶다", resultNow: "기다린 판단이 더 합리적이었다" },
  { id: "regret-4", name: "Tesla", oldPrice: 210000, currentPrice: 260000, changeRate: 23.8, memo: "변동성이 큰 종목은 기록 기준이 필요", thoughtThen: "뉴스가 너무 시끄럽다", resultNow: "관심 종목은 노이즈와 thesis를 분리해야 한다" },
  { id: "regret-5", name: "MacBook Pro", oldPrice: 3200000, currentPrice: 3500000, changeRate: 9.4, memo: "필수 장비는 가격보다 생산성 회수 기간으로 판단", thoughtThen: "다음 세대를 기다리자", resultNow: "업무 효율 손실이 더 비쌌다" },
];

export const insights: Insight[] = [
  { id: "insight-1", title: "부의 추월차선", sourceType: "book", keySentence: "소비가 아니라 시스템을 사는 사람이 속도를 만든다.", actionItem: "사고 싶은 물건마다 수익 자산 기준으로 재해석하기", tags: ["wealth", "system"], relatedGoal: "Asset Calculator" },
  { id: "insight-2", title: "Atomic Habits", sourceType: "book", keySentence: "환경 설계는 의지력보다 오래 간다.", actionItem: "책상 위 도구를 매일 쓰는 것만 남기기", tags: ["habit", "workspace"], relatedGoal: "Standing Desk" },
  { id: "insight-3", title: "Zero to One", sourceType: "book", keySentence: "작은 독점은 명확한 관점에서 출발한다.", actionItem: "AIOP의 첫 사용자를 나 자신으로 좁히기", tags: ["startup", "focus"], relatedGoal: "AIOP MVP" },
  { id: "insight-4", title: "Naval Almanack", sourceType: "article", keySentence: "판단력은 반복해서 기록한 결정에서 자란다.", actionItem: "구매 보류 사유를 Want마다 한 줄로 남기기", tags: ["decision", "life"], relatedGoal: "Regret Tracker" },
];

export const notes: Note[] = [
  { id: "note-1", title: "카메라 구매 기준", body: "여행 빈도보다 기록 프로젝트가 먼저 생기면 구매 판단.", tags: ["want", "hobby"], createdAt: "Today 09:20" },
  { id: "note-2", title: "구독 정리", body: "영상 서비스는 한 달에 하나만 유지하는 실험.", tags: ["subscription"], createdAt: "Yesterday 22:10" },
  { id: "note-3", title: "책 문장", body: "소유하고 싶은 물건이 아니라 반복하고 싶은 행동을 산다.", tags: ["insight"], createdAt: "Mon 18:45" },
];
