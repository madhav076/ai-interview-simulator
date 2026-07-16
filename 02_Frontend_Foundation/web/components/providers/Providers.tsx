"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { LoadingProvider } from "./LoadingProvider";
import { ErrorBoundary } from "./ErrorBoundary";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LoadingProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </LoadingProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
