"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type LocalStorageChangeDetail = {
  key: string;
  value: unknown;
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const initialValueRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function readStoredValue() {
      try {
        const storedValue = window.localStorage.getItem(key);
        if (storedValue === null) {
          setValue(initialValueRef.current);
          return;
        }

        setValue(JSON.parse(storedValue) as T);
      } catch (error) {
        console.warn(`Failed to read localStorage key: ${key}`, error);
        setValue(initialValueRef.current);
      } finally {
        setIsHydrated(true);
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== key && event.key !== null) return;
      readStoredValue();
    }

    function handleSameTabStorage(event: Event) {
      const detail = (event as CustomEvent<LocalStorageChangeDetail>).detail;
      if (detail?.key !== key) return;
      setValue(detail.value as T);
    }

    readStoredValue();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("aiop:local-storage-change", handleSameTabStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("aiop:local-storage-change", handleSameTabStorage);
    };
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
