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
        "relative inline-flex h-8 w-16 items-center overflow-hidden rounded-full border p-1",
        "transition-all duration-300 active:scale-95",
        dark
          ? "border-blue-400/40 bg-slate-800 shadow-inner shadow-black/30"
          : "border-blue-100 bg-blue-50 shadow-inner shadow-blue-100",
      ].join(" ")}
    >
      {/* icon nền bên trái */}
      <span
        className={[
          "pointer-events-none absolute left-2 top-1/2 z-0 -translate-y-1/2",
          "transition-opacity duration-300",
          dark ? "opacity-70 text-yellow-400" : "opacity-0",
        ].join(" ")}
      >
        <LightModeOutlinedIcon sx={{ fontSize: 15 }} />
      </span>

      {/* icon nền bên phải */}
      <span
        className={[
          "pointer-events-none absolute right-2 top-1/2 z-0 -translate-y-1/2",
          "transition-opacity duration-300",
          dark ? "opacity-0" : "opacity-70 text-blue-300",
        ].join(" ")}
      >
        <DarkModeOutlinedIcon sx={{ fontSize: 15 }} />
      </span>

      {/* nút tròn chính */}
      <span
        className={[
          "absolute left-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full",
          "bg-white shadow-md transition-all duration-300",
          dark
            ? "translate-x-8 rotate-180 text-blue-500"
            : "translate-x-0 rotate-0 text-yellow-500",
        ].join(" ")}
      >
        {dark ? (
          <DarkModeOutlinedIcon sx={{ fontSize: 15 }} />
        ) : (
          <LightModeOutlinedIcon sx={{ fontSize: 15 }} />
        )}
      </span>
    </button>
  );
}