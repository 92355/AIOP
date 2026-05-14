-- ============================================================
-- AIOP v2.0 Initial Schema
-- Auth: Google OAuth (Supabase Auth)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================


-- ============================================================
-- updated_at 자동 갱신 트리거 함수
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- profiles (Google OAuth 유저 정보 캐시)
-- Google 로그인 시 auth.users.raw_user_meta_data 에서 자동 생성
-- ============================================================
CREATE TABLE profiles (
  user_id     uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: 본인 데이터만 조회" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles: 본인 데이터만 수정" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 신규 유저 가입 시 profiles + user_settings 자동 생성 트리거
-- Google OAuth 첫 로그인 → auth.users INSERT → 이 함수 실행
-- SECURITY DEFINER: auth.users 메타데이터를 읽기 위해 필요
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 1. wants (구매 목표)
-- ============================================================
CREATE TABLE wants (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    text        NOT NULL,
  price                   numeric     NOT NULL,
  category                text        NOT NULL CHECK (category IN ('Productivity', 'Lifestyle', 'Investment', 'Hobby')),
  reason                  text        NOT NULL DEFAULT '',
  status                  text        NOT NULL DEFAULT 'thinking' CHECK (status IN ('thinking', 'planned', 'bought', 'skipped')),
  score                   integer     NOT NULL DEFAULT 0,
  required_capital        numeric     NOT NULL DEFAULT 0,
  target_date             text        NOT NULL DEFAULT '',
  priority                text        CHECK (priority IN ('low', 'medium', 'high')),
  target_months           integer,
  expected_yield          numeric,
  monthly_cashflow_needed numeric,
  currency                text        NOT NULL DEFAULT 'KRW' CHECK (currency IN ('KRW', 'USD')),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wants: 본인 데이터만 조회" ON wants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wants: 본인 데이터만 삽입" ON wants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wants: 본인 데이터만 수정" ON wants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "wants: 본인 데이터만 삭제" ON wants FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER wants_updated_at
  BEFORE UPDATE ON wants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 2. subscriptions (구독 관리)
-- ============================================================
CREATE TABLE subscriptions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service       text        NOT NULL,
  monthly_price numeric     NOT NULL,
  category      text        NOT NULL DEFAULT '',
  usage         text        NOT NULL DEFAULT 'monthly' CHECK (usage IN ('daily', 'weekly', 'monthly', 'rare')),
  value_score   integer     NOT NULL DEFAULT 0,
  status        text        NOT NULL DEFAULT 'keep' CHECK (status IN ('keep', 'review', 'cancel')),
  billing_day   integer     CHECK (billing_day BETWEEN 1 AND 31),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions: 본인 데이터만 조회" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "subscriptions: 본인 데이터만 삽입" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions: 본인 데이터만 수정" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "subscriptions: 본인 데이터만 삭제" ON subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 3. insights (인사이트 보관함)
-- ============================================================
CREATE TABLE insights (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  source_type   text        NOT NULL CHECK (source_type IN ('book', 'video', 'article', 'thought')),
  key_sentence  text        NOT NULL DEFAULT '',
  action_item   text        NOT NULL DEFAULT '',
  tags          text[]      NOT NULL DEFAULT '{}',
  related_goal  text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX insights_tags_gin ON insights USING GIN (tags);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights: 본인 데이터만 조회" ON insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights: 본인 데이터만 삽입" ON insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights: 본인 데이터만 수정" ON insights FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insights: 본인 데이터만 삭제" ON insights FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 4. notes (노트 / 인박스)
-- ============================================================
CREATE TABLE notes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text,
  body          text        NOT NULL DEFAULT '',
  tags          text[]      NOT NULL DEFAULT '{}',
  status        text        NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'processed', 'archived')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notes_tags_gin ON notes USING GIN (tags);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes: 본인 데이터만 조회" ON notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes: 본인 데이터만 삽입" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes: 본인 데이터만 수정" ON notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes: 본인 데이터만 삭제" ON notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 5. todos (할 일)
-- ============================================================
CREATE TABLE todos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  memo          text,
  status        text        NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  priority      text        NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date      text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos: 본인 데이터만 조회" ON todos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "todos: 본인 데이터만 삽입" ON todos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos: 본인 데이터만 수정" ON todos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "todos: 본인 데이터만 삭제" ON todos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Dashboard read indexes / 대시보드 조회 최적화 인덱스
-- RSC dashboard queries filter by user_id and order by created_at DESC.
-- RSC 대시보드는 user_id 필터와 created_at DESC 정렬을 함께 사용한다.
-- ============================================================
CREATE INDEX IF NOT EXISTS wants_user_created_at_idx ON wants (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS subscriptions_user_created_at_idx ON subscriptions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS insights_user_created_at_idx ON insights (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notes_user_created_at_idx ON notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS todos_user_created_at_idx ON todos (user_id, created_at DESC);


-- ============================================================
-- 6. retros (K.P.T 회고)
-- keep / problem / try 는 RetroItem[] 구조 그대로 JSONB 저장
-- RetroItem: { id, text, done?, linkedTodoId?, carriedFrom? }
-- ============================================================
CREATE TABLE retros (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          text        NOT NULL, -- 'YYYY-MM-DD'
  keep          jsonb       NOT NULL DEFAULT '[]',
  problem       jsonb       NOT NULL DEFAULT '[]',
  try           jsonb       NOT NULL DEFAULT '[]',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE retros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retros: 본인 데이터만 조회" ON retros FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "retros: 본인 데이터만 삽입" ON retros FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "retros: 본인 데이터만 수정" ON retros FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "retros: 본인 데이터만 삭제" ON retros FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER retros_updated_at
  BEFORE UPDATE ON retros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 7. regret_items (그때 살걸 기록장)
-- result_percent / profit_amount 는 조회 시 mapper에서 계산
-- ============================================================
CREATE TABLE regret_items (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  asset_type      text        NOT NULL,
  symbol          text,
  watched_price   numeric     NOT NULL,
  current_price   numeric     NOT NULL,
  currency        text        NOT NULL DEFAULT 'KRW' CHECK (currency IN ('KRW', 'USD')),
  quantity        numeric     NOT NULL,
  watched_at      text,
  note            text        NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE regret_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regret_items: 본인 데이터만 조회" ON regret_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "regret_items: 본인 데이터만 삽입" ON regret_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "regret_items: 본인 데이터만 수정" ON regret_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "regret_items: 본인 데이터만 삭제" ON regret_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER regret_items_updated_at
  BEFORE UPDATE ON regret_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 8. dashboard_layouts (대시보드 레이아웃, 유저당 1행)
-- ============================================================
CREATE TABLE dashboard_layouts (
  user_id       uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  layout        jsonb       NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_layouts: 본인 데이터만 조회" ON dashboard_layouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts: 본인 데이터만 삽입" ON dashboard_layouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts: 본인 데이터만 수정" ON dashboard_layouts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dashboard_layouts: 본인 데이터만 삭제" ON dashboard_layouts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 9. user_settings (테마, 컴팩트 모드, 히어로 메시지, 유저당 1행)
-- handle_new_user 트리거에서 자동 생성됨
-- ============================================================
CREATE TABLE user_settings (
  user_id       uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode    text        NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  compact_mode  boolean     NOT NULL DEFAULT false,
  hero_message  text        NOT NULL DEFAULT '',
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings: 본인 데이터만 조회" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings: 본인 데이터만 삽입" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings: 본인 데이터만 수정" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_settings: 본인 데이터만 삭제" ON user_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 10. exchange_rates (환율 캐시)
-- Frankfurter API 응답을 서버 Route Handler가 캐시
-- ============================================================
CREATE TABLE exchange_rates (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency   text        NOT NULL CHECK (base_currency IN ('KRW', 'USD')),
  quote_currency  text        NOT NULL CHECK (quote_currency IN ('KRW', 'USD')),
  rate            numeric     NOT NULL CHECK (rate > 0),
  rate_date       date        NOT NULL,
  provider        text        NOT NULL DEFAULT 'frankfurter',
  fetched_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (base_currency, quote_currency, rate_date, provider)
);

CREATE INDEX exchange_rates_pair_fetched_at_idx
  ON exchange_rates (base_currency, quote_currency, provider, fetched_at DESC);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exchange_rates: 인증 사용자 조회" ON exchange_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "exchange_rates: 인증 사용자 삽입" ON exchange_rates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "exchange_rates: 인증 사용자 수정" ON exchange_rates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
