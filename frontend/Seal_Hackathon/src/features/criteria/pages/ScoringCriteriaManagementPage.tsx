import type { ReactNode } from "react";
import { useMemo } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

import { ScoringCriteriaDialog } from "@/features/criteria/components/scoring/ScoringCriteriaDialog";
import { ScoringCriteriaFilterBar } from "@/features/criteria/components/scoring/ScoringCriteriaFilterBar";
import { ScoringCriteriaList } from "@/features/criteria/components/scoring/ScoringCriteriaList";
import { ScoringCriteriaPagination } from "@/features/criteria/components/scoring/ScoringCriteriaPagination";
import { ScoringCriteriaStats } from "@/features/criteria/components/scoring/ScoringCriteriaStats";
import { useScoringCriteriaManagement } from "@/features/criteria/hooks/useScoringCriteriaManagement";
import { CRITERIA_CATEGORIES } from "@/types/criteria.types";

function HeroStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent,
        ].join(" ")}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-black leading-none text-white tabular-nums">{value}</p>
        <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export function ScoringCriteriaManagementPage() {
  const {
    category,
    active,
    technical,
    page,
    dialogState,
    setPage,
    setDialogState,
    setCategory,
    setActive,
    setTechnical,
    criteria,
    pageData,
    totals,
    criteriaQuery,
    activateMutation,
    deleteMutation,
  } = useScoringCriteriaManagement();

  const activeOnPage = useMemo(
    () => criteria.filter((item) => item.isActive).length,
    [criteria],
  );

  const countByCategory = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const cat of CRITERIA_CATEGORIES) acc[cat] = 0;
    for (const item of criteria) {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
    }
    return acc;
  }, [criteria]);

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      {/* ===== Hero banner poster ===== */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8">
        {/* glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
        />
        {/* dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* decorative category ribbon (poster art) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-6 hidden gap-1.5 lg:flex"
        >
          {["from-blue-500 to-cyan-400", "from-violet-500 to-fuchsia-400", "from-amber-500 to-orange-400", "from-emerald-500 to-teal-400", "from-rose-500 to-pink-400"].map(
            (g, i) => (
              <span
                key={i}
                className={["h-16 w-2.5 rounded-full bg-linear-to-b opacity-70", g].join(" ")}
                style={{ transform: `translateY(${(i % 2) * 10}px)` }}
              />
            ),
          )}
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
                Coordinator Workspace · Grading
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                <RuleOutlinedIcon sx={{ fontSize: 34 }} className="text-blue-300" />
                Scoring Criteria{" "}
                <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  Templates
                </span>
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-400 sm:text-base">
                Global rubric templates every event draws from. ADMIN &amp; COORDINATOR can
                create, update, activate, deactivate and delete them.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => criteriaQuery.refetch()}
                disabled={criteriaQuery.isFetching}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-slate-200 backdrop-blur-sm transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:opacity-50"
              >
                <RefreshOutlinedIcon
                  sx={{ fontSize: 19 }}
                  className={criteriaQuery.isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setDialogState({ mode: "CREATE" })}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] motion-reduce:active:scale-100"
              >
                <AddOutlinedIcon sx={{ fontSize: 20 }} />
                Create Criteria
              </button>
            </div>
          </div>

          {/* Glass stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat
              icon={<LayersOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Total templates"
              value={totals.total}
              accent="bg-blue-500/20 text-blue-300"
            />
            <HeroStat
              icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Active on page"
              value={activeOnPage}
              accent="bg-emerald-500/20 text-emerald-300"
            />
            <HeroStat
              icon={<BoltOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Technical on page"
              value={totals.technical}
              accent="bg-cyan-500/20 text-cyan-300"
            />
            <HeroStat
              icon={<FavoriteBorderOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Soft on page"
              value={totals.soft}
              accent="bg-violet-500/20 text-violet-300"
            />
          </div>
        </div>
      </header>

      {/* ===== Category palette poster band ===== */}
      <ScoringCriteriaStats
        countByCategory={countByCategory}
        totalOnPage={criteria.length}
      />

      {/* ===== Directory panel ===== */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ScoringCriteriaFilterBar
          category={category}
          active={active}
          technical={technical}
          countByCategory={countByCategory}
          onCategoryChange={setCategory}
          onActiveChange={setActive}
          onTechnicalChange={setTechnical}
        />

        <ScoringCriteriaList
          criteria={criteria}
          isLoading={criteriaQuery.isLoading}
          isError={criteriaQuery.isError}
          isActivating={activateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onEdit={setDialogState}
          onToggleActive={(item) => activateMutation.mutate(item)}
          onDelete={(criteriaId) => deleteMutation.mutate(criteriaId)}
        />

        <ScoringCriteriaPagination
          page={page}
          totalPages={pageData?.totalPages ?? 0}
          onPageChange={setPage}
        />
      </section>

      <ScoringCriteriaDialog
        state={dialogState}
        onClose={() => setDialogState(null)}
      />
    </div>
  );
}
