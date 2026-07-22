import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { PendingRequest } from "@/types/user.types";

function getPendingBadgeStyle(type: PendingRequest["type"]) {
  switch (type) {
    case "STUDENT_REGISTRATION":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "ROLE_UPGRADE":
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  }
}

export function DashboardPendingUsers({
  pendingRequests,
  isLoading,
}: {
  pendingRequests: PendingRequest[];
  isLoading?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <PendingActionsOutlinedIcon
              className="text-blue-500"
              sx={{ fontSize: 20 }}
            />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Pending Users
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Users waiting for approval. Read-only view.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/users?status=PENDING_APPROVAL")}
          className="inline-flex cursor-pointer items-center gap-1 self-start rounded-lg px-2 py-1 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          Manage Users
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
            >
              <div>
                <Skeleton
                  variant="text"
                  width={160}
                  height={20}
                  className="dark:bg-slate-600 mt-1"
                />
                <Skeleton
                  variant="text"
                  width={110}
                  height={16}
                  className="dark:bg-slate-600 mt-1"
                />
              </div>
              <Skeleton
                variant="rounded"
                width={90}
                height={22}
                className="dark:bg-slate-600 mt-1"
              />
            </div>
          ))
        ) : pendingRequests.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-700">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <TaskAltOutlinedIcon className="text-emerald-500" />
            </span>
            <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
              All caught up!
            </p>
            <p className="mt-1 text-sm text-slate-400">
              No users are waiting for approval.
            </p>
          </div>
        ) : (
          pendingRequests.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center dark:border-slate-800 dark:hover:border-blue-500/40 dark:hover:bg-slate-800/60"
            >
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                  Submitted on {item.submittedAt}
                </p>
              </div>
              <span
                className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest sm:self-auto ${getPendingBadgeStyle(item.type)}`}
              >
                {item.type.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
