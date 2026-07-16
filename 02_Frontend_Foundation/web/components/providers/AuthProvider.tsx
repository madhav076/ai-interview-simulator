"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store";

/**
 * Runs once on app mount.
 * If a JWT token is present in localStorage, validates it against the backend
 * by calling fetchProfile(). This restores the session on page refresh
 * without forcing the user to log in again.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
