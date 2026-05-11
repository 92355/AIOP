export function prependLocalStorageItem<T>(key: string, item: T, fallbackItems: T[]) {
  if (typeof window === "undefined") return;

  let currentItems = fallbackItems;

  try {
    const storedValue = window.localStorage.getItem(key);
    const parsedValue = storedValue ? (JSON.parse(storedValue) as unknown) : null;

    if (Array.isArray(parsedValue)) {
      currentItems = parsedValue as T[];
    }
  } catch (error) {
    console.warn(`Failed to parse localStorage key: ${key}`, error);
  }

  try {
    const nextItems = [item, ...currentItems];
    window.localStorage.setItem(key, JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent("aiop:local-storage-change", { detail: { key, value: nextItems } }));
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error);
  }
}
