"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type ProfileInfo = {
  email: string;
  fullName: string;
  avatarUrl: string;
};

export function ProfileBadge() {
  const router = useRouter();
  const { isCompact } = useCompactMode();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    // user_metadata에 Google 프로필이 들어있음 (full_name, avatar_url)
    // user.user_metadata holds Google profile (full_name, avatar_url)
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const meta = data.user.user_metadata ?? {};
      setProfile({
        email: data.user.email ?? "",
        fullName: meta.full_name ?? meta.name ?? "사용자",
        avatarUrl: meta.avatar_url ?? meta.picture ?? "",
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/login");
    router.refresh();
  }

  if (!profile) return null;

  const sizeClass = isCompact ? "h-10" : "h-11";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="프로필 메뉴 열기"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 pl-1 pr-1 text-zinc-300 hover:text-zinc-50 sm:pr-3 ${sizeClass}`}
      >
        <Avatar avatarUrl={profile.avatarUrl} fullName={profile.fullName} isCompact={isCompact} />
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-zinc-100 sm:inline">
          {profile.fullName}
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[70] w-64 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-soft"
        >
          <div className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3">
            <Avatar avatarUrl={profile.avatarUrl} fullName={profile.fullName} isCompact={false} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-50">{profile.fullName}</p>
              <p className="truncate text-xs text-zinc-500">{profile.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            role="menuitem"
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-zinc-400" />
            <span>{isSigningOut ? "로그아웃 중..." : "로그아웃"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({
  avatarUrl,
  fullName,
  isCompact,
}: {
  avatarUrl: string;
  fullName: string;
  isCompact: boolean;
}) {
  const size = isCompact ? "h-8 w-8" : "h-9 w-9";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={fullName}
        referrerPolicy="no-referrer"
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300`}
      aria-hidden="true"
    >
      <User className="h-4 w-4" />
    </div>
  );
}
