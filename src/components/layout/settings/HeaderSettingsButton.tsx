"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Settings } from "lucide-react";
import { SettingsMenu } from "@/components/layout/settings/SettingsMenu";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type HeaderSettingsButtonProps = {
  isMobileLayout: boolean;
};

export function HeaderSettingsButton({ isMobileLayout }: HeaderSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEscapeKey(isOpen, () => setIsOpen(false));

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [isMobileLayout]);

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
      {isOpen && isMobileLayout && isMounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-end bg-zinc-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-full p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]" onClick={(event) => event.stopPropagation()}>
                <SettingsMenu
                  onClose={() => setIsOpen(false)}
                  className="max-h-[80dvh] w-full rounded-2xl"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
      {isOpen && !isMobileLayout ? (
        <div className="absolute right-0 top-12 z-[70]">
          <SettingsMenu onClose={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
