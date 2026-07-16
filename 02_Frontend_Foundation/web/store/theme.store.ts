import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system", // default to system mode
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";
          return { theme: nextTheme };
        }),
    }),
    {
      name: "theme-store",
      skipHydration: true, // Manual hydration avoids Next.js server-client mismatch
    }
  )
);
