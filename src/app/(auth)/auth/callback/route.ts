import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase가 Google 인증 후 ?code=... 로 리다이렉트하면
// 이 핸들러가 code → session 교환 후 next 경로로 보낸다.
// Handles the OAuth code returned by Supabase after Google auth,
// exchanges it for a session, and redirects to `next` (default: "/").
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // 코드 없거나 교환 실패 / Missing code or exchange failed
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
