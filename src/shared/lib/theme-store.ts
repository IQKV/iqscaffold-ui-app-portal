import { create } from "zustand";
import { persist } from "zustand/middleware";

type ColorScheme = "light" | "dark";

interface ThemeStore {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorScheme: "light",
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "theme-storage",
    }
  )
);
