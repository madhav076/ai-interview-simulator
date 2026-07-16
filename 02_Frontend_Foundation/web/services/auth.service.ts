import { api } from "@/lib/axios";
import type { User } from "@/types";

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

/** Log out the current user (client-side only — clears localStorage). */
export async function logout(): Promise<void> {
  // The backend has no logout endpoint; token invalidation is client-side.
  return Promise.resolve();
}

/** Fetch the currently authenticated user's profile. */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/api/auth/profile");
  return data.user;
}
