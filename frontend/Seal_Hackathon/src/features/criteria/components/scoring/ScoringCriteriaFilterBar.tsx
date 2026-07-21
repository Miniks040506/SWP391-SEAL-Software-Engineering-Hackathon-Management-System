import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import {
  CRITERIA_CATEGORIES,
  type BooleanFilterValue,
  type CriteriaFilterValue,
} from "@/types/criteria.types";
import { getCategoryTheme } from "@/features/criteria/constants/criteriaUi";

type ScoringCriteriaFilterBarProps = {
  category: CriteriaFilterValue;
  active: BooleanFilterValue;
  technical: BooleanFilterValue;
  countByCategory?: Record<string, number>;
  onCategoryChange: (value: CriteriaFilterValue) => void;
  onActiveChange: (value: BooleanFilterValue) => void;
  onTechnicalChange: (value: BooleanFilterValue) => void;
};

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
              isActive
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function ScoringCriteriaFilterBar({
  category,
  active,
  technical,
  countByCategory,
  onCategoryChange,
  onActiveChange,
  onTechnicalChange,
}: ScoringCriteriaFilterBarProps) {
  return (
    <div className="space-y-4 border-b border-slate-100 p-5 dark:border-slate-800">
      {/* Category pills */}
      <div>
        <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <TuneOutlinedIcon sx={{ fontSize: 15 }} />
          Filter by category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange("ALL")}
            className={[
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
              category === "ALL"
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
            ].join(" ")}
          >
            All categories
          </button>

          {CRITERIA_CATEGORIES.map((cat) => {
            const theme = getCategoryTheme(cat);
            const isActive = category === cat;
            const count = countByCategory?.[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={[
                  "relative inline-flex cursor-pointer items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                  isActive
                    ? "text-white shadow-md"
                    : `ring-1 ring-inset ${theme.badge} hover:brightness-95`,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-white/90" : theme.dot,
                  ].join(" ")}
                />
                {cat}
                {typeof count === "number" && (
                  <span
                    className={[
                      "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      isActive ? "bg-white/20" : "bg-black/5 dark:bg-white/10",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden
                    className={[
                      "absolute inset-0 -z-10 rounded-full bg-linear-to-r",
                      theme.gradient,
                    ].join(" ")}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status + technical toggles */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Status
          </span>
          <SegmentedToggle<BooleanFilterValue>
            value={active}
            onChange={onActiveChange}
            options={[
              { value: "ALL", label: "All" },
              { value: "TRUE", label: "Active" },
              { value: "FALSE", label: "Inactive" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Type
          </span>
          <SegmentedToggle<BooleanFilterValue>
            value={technical}
            onChange={onTechnicalChange}
            options={[
              { value: "ALL", label: "All" },
              { value: "TRUE", label: "Technical" },
              { value: "FALSE", label: "Soft" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
