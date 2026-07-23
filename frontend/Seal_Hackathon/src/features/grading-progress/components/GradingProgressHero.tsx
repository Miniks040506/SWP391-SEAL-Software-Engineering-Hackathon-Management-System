import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

export interface HeroBreadcrumb {
    label: string;
    to?: string;
}

interface GradingProgressHeroProps {
    breadcrumbs: HeroBreadcrumb[];
    title: string;
    subtitle?: string;
    chips?: ReactNode;
    isLive: boolean;
    updatedLabel: string;
    isRefetching: boolean;
    onRefresh: () => void;
}

/**
 * Shared mission-control hero: breadcrumb trail, title, lifecycle chips and
 * the live-monitoring cluster (pulse dot + "updated Xs ago" + refresh).
 */
export const GradingProgressHero = ({
    breadcrumbs,
    title,
    subtitle,
    chips,
    isLive,
    updatedLabel,
    isRefetching,
    onRefresh,
}: GradingProgressHeroProps) => {
    return (
        <header
            className="gp-fade-up relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 md:p-8 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40"
            style={{ "--gp-stagger": 0 } as CSSProperties}
        >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-indigo-500/10" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm font-semibold">
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                                    {crumb.to && !isLast ? (
                                        <Link
                                            to={crumb.to}
                                            className="rounded text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span
                                            className={
                                                isLast
                                                    ? "text-slate-900 dark:text-white"
                                                    : "text-slate-500 dark:text-slate-400"
                                            }
                                            aria-current={isLast ? "page" : undefined}
                                        >
                                            {crumb.label}
                                        </span>
                                    )}
                                    {!isLast && (
                                        <ChevronRightOutlinedIcon
                                            sx={{ fontSize: 16 }}
                                            className="text-slate-400 dark:text-slate-600"
                                        />
                                    )}
                                </span>
                            );
                        })}
                    </nav>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            {subtitle}
                        </p>
                    )}
                    {chips && <div className="mt-4 flex flex-wrap items-center gap-2">{chips}</div>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-4 lg:flex-col lg:items-end lg:gap-3">
                    <div className="flex items-center gap-2.5">
                        {isLive ? (
                            <>
                                <span className="gp-live-dot inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Live monitoring
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Auto-refresh off
                                </span>
                            </>
                        )}
                        {updatedLabel && (
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                · Updated {updatedLabel}
                            </span>
                        )}
                    </div>
                    <Tooltip title="Refresh progress data now">
                        <span>
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={
                                    <RefreshOutlinedIcon className={isRefetching ? "gp-spin" : undefined} />
                                }
                                onClick={onRefresh}
                                disabled={isRefetching}
                                sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                            >
                                {isRefetching ? "Refreshing…" : "Refresh"}
                            </Button>
                        </span>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};
