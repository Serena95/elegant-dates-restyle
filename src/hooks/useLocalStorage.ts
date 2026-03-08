import { useState, useCallback, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    };

    const onLocalUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string; value: T }>;
      if (!customEvent.detail || customEvent.detail.key !== key) return;
      setStoredValue(customEvent.detail.value);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("local-storage", onLocalUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("local-storage", onLocalUpdate as EventListener);
    };
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(new CustomEvent("local-storage", { detail: { key, value: newValue } }));
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue];
}

