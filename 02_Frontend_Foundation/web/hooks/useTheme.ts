"use client";

import { useCallback, useEffect } from "react";
import { useThemeStore } from "@/store";

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const isDark = useCallback(() => {
    if (theme === "system") {
      return typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    }
    return theme === "dark";
  }, [theme]);

  return { theme, setTheme, toggleTheme, isDark };
}
