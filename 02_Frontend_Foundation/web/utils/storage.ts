/** Get a value from localStorage with type safety and SSR protection. */
export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return fallback;

    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch {
    console.warn(`Error reading localStorage key "${key}"`);
    return fallback;
  }
}

/** Set a value in localStorage with type safety and SSR protection. */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Error setting localStorage key "${key}"`);
  }
}

/** Remove a value from localStorage. */
export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    console.warn(`Error removing localStorage key "${key}"`);
  }
}

/** Clear all localStorage. */
export function clear(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.clear();
  } catch {
    console.warn("Error clearing localStorage");
  }
}

/** Get a value from sessionStorage with type safety and SSR protection. */
export function getSessionItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.sessionStorage.getItem(key);
    return item !== null ? (JSON.parse(item) as T) : fallback;
  } catch {
    console.warn(`Error reading sessionStorage key "${key}"`);
    return fallback;
  }
}

/** Set a value in sessionStorage with type safety and SSR protection. */
export function setSessionItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Error setting sessionStorage key "${key}"`);
  }
}

/** Remove a value from sessionStorage. */
export function removeSessionItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    console.warn(`Error removing sessionStorage key "${key}"`);
  }
}

/** Clear all sessionStorage. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.clear();
  } catch {
    console.warn("Error clearing sessionStorage");
  }
}
