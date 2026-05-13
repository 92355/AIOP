"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleLogin() {
    // Google OAuth 로그인 시작 / Start Google OAuth flow
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
    // 성공 시 Google로 redirect되므로 setIsLoading(false) 불필요
    // On success, browser is redirected to Google — no need to reset loading state
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-soft">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-50">aiOP</h1>
          <p className="mt-2 text-sm text-zinc-500">로그인하고 데이터를 동기화하세요.</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-50"
        >
          {isLoading ? "이동 중..." : "Google로 계속하기"}
        </button>

        {errorMessage ? (
          <p className="mt-4 text-center text-sm text-red-300">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
