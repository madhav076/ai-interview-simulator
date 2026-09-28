import { api } from "@/lib/axios";
import type { User } from "@/types";
import { removeItem } from "@/utils/storage";

/** Authenticate a user with email and password. Returns token + user. */
export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const { data } = await api.post<{ token: string; user: User }>(
    "/api/auth/login",
    { email, password },
  );
  return data;
}

/** Register a new user account. Does not return a token. */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ user: User }> {
  const { data } = await api.post<{ user: User }>("/api/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

/** Log out the current user (clears auth tokens and session cookies). */
export async function logout(): Promise<void> {
  removeItem("auth_token");
  removeItem("auth_user");
  if (typeof document !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }
  return Promise.resolve();
}

/** Fetch the currently authenticated user's profile. */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/api/auth/profile");
  return data.user;
}
