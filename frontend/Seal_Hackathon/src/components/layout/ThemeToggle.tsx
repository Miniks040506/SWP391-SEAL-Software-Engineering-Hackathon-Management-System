import "@/components/layout/theme-transition.css";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle light and dark mode"
      onClick={() => toggleTheme()}
      className={[
        "relative inline-flex h-8 w-16 items-center rounded-full border p-1",
        "transition-all duration-300 active:scale-95",
        dark
          ? "border-blue-400/40 bg-slate-800 shadow-inner shadow-black/30"
          : "border-blue-100 bg-blue-50 shadow-inner shadow-blue-100",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full",
          "bg-white text-blue-500 shadow-md transition-all duration-300",
          dark ? "translate-x-8 rotate-180" : "translate-x-0 rotate-0",
        ].join(" ")}
      >
        {dark ? (
          <DarkModeOutlinedIcon sx={{ fontSize: 15 }} />
        ) : (
          <LightModeOutlinedIcon sx={{ fontSize: 15 }} />
        )}
      </span>

      <span className="ml-1 text-yellow-500 opacity-80">
        <LightModeOutlinedIcon sx={{ fontSize: 13 }} />
      </span>

      <span className="ml-auto mr-1 text-blue-200 opacity-80">
        <DarkModeOutlinedIcon sx={{ fontSize: 13 }} />
      </span>
    </button>
  );
}