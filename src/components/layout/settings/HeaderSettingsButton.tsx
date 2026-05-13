"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { SettingsMenu } from "@/components/layout/settings/SettingsMenu";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type HeaderSettingsButtonProps = {
  isMobileLayout: boolean;
};

export function HeaderSettingsButton({ isMobileLayout }: HeaderSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEscapeKey(isOpen, () => setIsOpen(false));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-50"
        aria-label="Dashboard layout 설정"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Settings className="h-4 w-4" />
      </button>
      {isOpen && isMobileLayout ? (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div className="w-full p-3" onClick={(event) => event.stopPropagation()}>
            <SettingsMenu
              onClose={() => setIsOpen(false)}
              className="max-h-[80dvh] w-full rounded-2xl"
            />
          </div>
        </div>
      ) : null}
      {isOpen && !isMobileLayout ? (
        <div className="absolute right-0 top-12 z-[70]">
          <SettingsMenu onClose={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
