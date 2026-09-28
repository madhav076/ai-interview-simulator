import { create } from "zustand";
import type { User } from "@/types";
import { getItem, setItem, removeItem } from "@/utils/storage";
import { api } from "@/lib/axios";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function getStoredToken(): string | null {
  return getItem<string | null>("auth_token", null) ?? getCookie("auth_token");
}

/** Write the token to both localStorage and a browser cookie for middleware. */
function persistToken(token: string): void {
  setItem("auth_token", token);
  if (typeof document !== "undefined") {
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

/** Clear the token from localStorage and the cookie. */
function clearToken(): void {
  removeItem("auth_token");
  if (typeof document !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
}

type AuthState = {
  /** The authenticated user, or null when logged out. */
  user: User | null;
  /** Raw JWT token persisted to localStorage as "auth_token". */
  token: string | null;
  /** True while a login / register / fetchProfile request is in flight. */
  isLoading: boolean;
  /** Last error message from auth operations. */
  error: string | null;

  /** Log in with email + password. Stores token + user on success. */
  login: (email: string, password: string) => Promise<void>;
  /** Register a new account. Does NOT auto-login. */
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Clear token and user from state and localStorage. */
  logout: () => void;
  /** Re-hydrate user from the stored token (called on app mount). */
  fetchProfile: () => Promise<void>;
  /** Reset the error field. */
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  user: null,
  token: getItem<string | null>("auth_token", null),
  isLoading: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<{ token: string; user: User }>(
        "/api/auth/login",
        { email, password },
      );

      // Normalise: backend returns user.id not _id
      const user: User = {
        id: data.user.id ?? (data.user as unknown as { _id: string })._id,
        name: data.user.name,
        email: data.user.email,
        createdAt: data.user.createdAt ?? new Date().toISOString(),
      };

      persistToken(data.token);
      setItem("auth_user", user);
      set({ token: data.token, user, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed. Please try again.";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/api/auth/register", { name, email, password });
      set({ isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    removeItem("auth_user");
    set({ token: null, user: null, error: null });
  },

  fetchProfile: async () => {
    const token = get().token ?? getStoredToken();
    if (!token) return;

    // Restore token into state if it came only from localStorage
    if (!get().token) {
      persistToken(token);
      set({ token });
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<{ user: User }>("/api/auth/profile");

      const user: User = {
        id: data.user.id ?? (data.user as unknown as { _id: string })._id,
        name: data.user.name,
        email: data.user.email,
        createdAt: data.user.createdAt ?? "",
      };

      setItem("auth_user", user);
      set({ user, isLoading: false });
    } catch {
      // Token is invalid or expired — clear everything
      clearToken();
      removeItem("auth_user");
      set({ token: null, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
