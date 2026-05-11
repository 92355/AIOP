"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const initialValueRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch (error) {
      console.warn(`Failed to read localStorage key: ${key}`, error);
      setValue(initialValueRef.current);
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to write localStorage key: ${key}`, error);
    }
  }, [isHydrated, key, value]);

  return [value, setValue];
}
