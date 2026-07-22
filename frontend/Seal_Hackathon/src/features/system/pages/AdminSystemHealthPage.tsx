import type { ReactNode } from "react";
import { Skeleton } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import { useSystemHealthQuery } from "@/features/system/hooks/useSystemQueries";

function HealthCard({
  title,
  ok,
  icon,
}: {
  title: string;
  ok: boolean;
  icon: ReactNode;
}) {
  return (
    <article className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-xl font-black text-slate-950 dark:text-white">
            {ok ? "Healthy" : "Unavailable"}
          </p>
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}
      >
        {ok ? (
          <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
        ) : (
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} />
        )}
        {ok ? "UP" : "DOWN"}
      </span>
    </article>
  );
}

export function AdminSystemHealthPage() {
  const { data, isLoading, isError, refetch, isFetching } =
    useSystemHealthQuery();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow="Administration Workspace"
        title="System"
        accentTitle="Health"
        description="Monitor the runtime dependencies used by notifications, reminders, storage and assistant support."
        icon={<HealthAndSafetyOutlinedIcon sx={{ fontSize: 34 }} />}
        actions={
          <button
            type="button"
            disabled={isFetching}
            onClick={() => refetch()}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
            {isFetching ? "Refreshing" : "Refresh"}
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-5">
          <Skeleton
            variant="rounded"
            height={88}
            className="rounded-3xl! dark:bg-slate-800"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={112}
                className="rounded-3xl! dark:bg-slate-800"
              />
            ))}
          </div>
          <Skeleton
            variant="rounded"
            height={260}
            className="rounded-3xl! dark:bg-slate-800"
          />
        </div>
      ) : isError || !data ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Could not load system health. Refresh the page to try again.
        </div>
      ) : (
        <>
          <section
            className={`flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between ${data.status === "UP" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${data.status === "UP" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}
              >
                {data.status === "UP" ? (
                  <CheckCircleOutlinedIcon />
                ) : (
                  <ErrorOutlineOutlinedIcon />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Overall system status
                </p>
                <p className="text-2xl font-black text-slate-950 tabular-nums dark:text-white">
                  {data.status}
                </p>
              </div>
            </div>
            <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300">
              {data.status === "UP"
                ? "All monitored dependencies are responding normally."
                : "One or more dependencies require administrator attention."}
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <HealthCard
              title="Database"
              ok={data.databaseUp}
              icon={<StorageOutlinedIcon />}
            />
            <HealthCard
              title="Mail"
              ok={data.mailUp}
              icon={<MailOutlineOutlinedIcon />}
            />
            <HealthCard
              title="Storage"
              ok={data.storageUp}
              icon={<CloudOutlinedIcon />}
            />
          </div>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Diagnostic details
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Raw dependency information returned by the health service.
              </p>
            </div>
            <div className="p-5">
              <pre className="max-h-96 overflow-auto rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-relaxed text-slate-100">
                {JSON.stringify(data.details ?? {}, null, 2)}
              </pre>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
