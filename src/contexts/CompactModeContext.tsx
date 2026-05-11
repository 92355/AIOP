"use client";

import { createContext, useContext } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type CompactModeContextValue = {
  isCompact: boolean;
  setCompact: (nextValue: boolean) => void;
  toggleCompact: () => void;
};

const CompactModeContext = createContext<CompactModeContextValue | null>(null);

export function CompactModeProvider({ children }: { children: React.ReactNode }) {
  const [isCompact, setIsCompact] = useLocalStorage<boolean>("aiop-compact-mode", false);

  function setCompact(nextValue: boolean) {
    setIsCompact(nextValue);
  }

  function toggleCompact() {
    setIsCompact((currentValue) => !currentValue);
  }

  return (
    <CompactModeContext.Provider value={{ isCompact, setCompact, toggleCompact }}>
      {children}
    </CompactModeContext.Provider>
  );
}

export function useCompactMode() {
  const context = useContext(CompactModeContext);

  if (!context) {
    throw new Error("useCompactMode must be used within CompactModeProvider");
  }

  return context;
}
