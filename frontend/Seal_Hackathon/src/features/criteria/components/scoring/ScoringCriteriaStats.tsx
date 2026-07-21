import type { ReactNode } from "react";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";

import { CRITERIA_CATEGORIES } from "@/types/criteria.types";
import { getCategoryTheme } from "@/features/criteria/constants/criteriaUi";

type ScoringCriteriaStatsProps = {
  countByCategory: Record<string, number>;
  totalOnPage: number;
};

const CATEGORY_ICON: Record<string, ReactNode> = {
  TECHNICAL: <CodeOutlinedIcon sx={{ fontSize: 22 }} />,
  PRESENTATION: <SlideshowOutlinedIcon sx={{ fontSize: 22 }} />,
  INNOVATION: <LightbulbOutlinedIcon sx={{ fontSize: 22 }} />,
  BUSINESS: <BusinessCenterOutlinedIcon sx={{ fontSize: 22 }} />,
  PROCESS: <AccountTreeOutlinedIcon sx={{ fontSize: 22 }} />,
};

export function ScoringCriteriaStats({
  countByCategory,
  totalOnPage,
}: ScoringCriteriaStatsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-linear-to-b from-blue-500 to-violet-500" />
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Category Palette
        </h2>
        <span className="text-xs font-medium text-slate-400">· on this page</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {CRITERIA_CATEGORIES.map((cat) => {
          const theme = getCategoryTheme(cat);
          const count = countByCategory[cat] ?? 0;
          const pct = totalOnPage > 0 ? Math.round((count / totalOnPage) * 100) : 0;

          return (
            <div
              key={cat}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {/* soft gradient glow */}
              <div
                aria-hidden
                className={[
                  "pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-linear-to-br opacity-15 blur-2xl transition-opacity group-hover:opacity-30",
                  theme.gradient,
                ].join(" ")}
              />

              <div className="relative flex items-center justify-between">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm",
                    theme.gradient,
                  ].join(" ")}
                >
                  {CATEGORY_ICON[cat]}
                </div>
                <span className="text-2xl font-black tabular-nums text-slate-950 dark:text-white">
                  {count}
                </span>
              </div>

              <p className="relative mt-3 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {cat}
              </p>

              {/* meter */}
              <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={["h-full rounded-full transition-all duration-500", theme.bar].join(" ")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
