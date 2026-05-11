"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { SettingsMenu } from "@/components/layout/settings/SettingsMenu";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export function SidebarSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEscapeKey(isOpen, () => setIsOpen(false));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex w-full items-center gap-3 rounded-2xl border border-zinc-800 px-3 py-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Settings className="h-4 w-4" />
        <span>설정</span>
      </button>
      {isOpen ? (
        <div className="absolute bottom-14 left-0 z-[70]">
          <SettingsMenu onClose={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
