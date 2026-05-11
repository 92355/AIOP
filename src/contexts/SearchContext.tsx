"use client";

import { createContext, useContext, useState } from "react";

type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }

  return context;
}

export function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}
