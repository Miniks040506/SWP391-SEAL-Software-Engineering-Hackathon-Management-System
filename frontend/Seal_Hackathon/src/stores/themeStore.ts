import { create } from "zustand";

export type AppTheme = "light" | "dark";

type ThemeStore = {
  theme: AppTheme;
  initializeTheme: () => void;
  toggleTheme: () => void;
};

type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem("seal-theme") as AppTheme | null;

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return "light";
}

function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",

  initializeTheme: () => {
    const theme = getInitialTheme();

    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme: AppTheme = currentTheme === "dark" ? "light" : "dark";

    const root = document.documentElement;
    const documentWithTransition = document as DocumentWithViewTransition;

    const changeTheme = () => {
      localStorage.setItem("seal-theme", nextTheme);
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    };

    if (!documentWithTransition.startViewTransition) {
      changeTheme();
      return;
    }

    root.classList.add("theme-wave-transitioning");
    root.classList.add(`theme-wave-to-${nextTheme}`);

    const transition = documentWithTransition.startViewTransition(() => {
      changeTheme();
    });

    transition.finished.finally(() => {
      root.classList.remove("theme-wave-transitioning");
      root.classList.remove(`theme-wave-to-${nextTheme}`);
    });
  },
}));