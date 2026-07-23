import { useState } from "react";
import { format } from "date-fns";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

import type { ExportJobResponse } from "@/types/export.types";
import { ExportStatusBadge } from "./ExportStatusBadge";

type Props = {
  jobs: ExportJobResponse[];
  onDownload: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  isDownloading?: boolean;
  isLoading?: boolean;
};

function formatBytes(bytes?: number | null) {
  if (
    bytes === undefined ||
    bytes === null ||
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return "-";
  }
  if (bytes === 0) return "0 B";
  const unit = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(unit)),
    sizes.length - 1,
  );
  return `${Number.parseFloat((bytes / unit ** index).toFixed(1))} ${sizes[index]}`;
}

function formatDate(value: string | null | undefined, pattern: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, pattern);
}

function isExpired(value: string | null | undefined, renderedAt: number) {
  if (!value) return false;
  const expiresAt = new Date(value).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= renderedAt;
}

function formatParams(params: Record<string, unknown> | null | undefined) {
  if (!params || typeof params !== "object") return "";
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(", ");
}

export const ExportJobTable = ({
  jobs,
  onDownload,
  onRetry,
  onDelete,
  isDownloading,
  isLoading,
}: Props) => {
  const [renderedAt] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width="70%"
              className="dark:bg-slate-700"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-b border-slate-100 px-5 py-5 last:border-0 dark:border-slate-800"
          >
            {Array.from({ length: 5 }).map((__, cell) => (
              <Skeleton
                key={cell}
                variant="text"
                width={cell === 3 ? "85%" : "65%"}
                className="dark:bg-slate-800"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
        <FileDownloadOutlinedIcon
          sx={{ fontSize: 36 }}
          className="text-slate-400"
        />
        <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
          No export jobs yet
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a report above to add it to this history.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60">
            <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4">Report</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">File</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => {
              const params = formatParams(job.params);
              const expired = isExpired(job.expiresAt, renderedAt);

              return (
                <tr
                  key={job.id}
                  className="transition-colors hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold tabular-nums">
                      {formatDate(job.requestedAt, "MMM dd, HH:mm")}
                    </p>
                    {job.expiresAt && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Expires {formatDate(job.expiresAt, "MMM dd, yyyy")}
                      </p>
                    )}
                  </td>
                  <td className="min-w-[220px] px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {job.exportType?.replace(/_/g, " ") || "Unknown report"}
                    </p>
                    {params && (
                      <p
                        className="mt-1 max-w-[240px] truncate font-mono text-[11px] text-slate-400"
                        title={params}
                      >
                        {params}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ExportStatusBadge status={job.status} />
                      {job.status === "FAILED" && job.errorMessage && (
                        <Tooltip title={job.errorMessage} placement="top" arrow>
                          <ErrorOutlineIcon
                            color="error"
                            sx={{ fontSize: 16, cursor: "help" }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="min-w-[200px] px-5 py-4">
                    <p
                      className="max-w-[220px] truncate font-semibold text-slate-700 dark:text-slate-300"
                      title={job.fileName ?? undefined}
                    >
                      {job.fileName || "-"}
                    </p>
                    <div className="mt-1 flex gap-3 text-[11px] text-slate-400">
                      <span>{formatBytes(job.fileSizeBytes)}</span>
                      {job.rowCount != null && (
                        <span className="tabular-nums">
                          {job.rowCount.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {job.status === "DONE" && (
                        <button
                          type="button"
                          onClick={() => onDownload(job.id)}
                          disabled={Boolean(isDownloading || expired)}
                          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
                        >
                          <DownloadIcon sx={{ fontSize: 15 }} />
                          {expired ? "Expired" : "Download"}
                        </button>
                      )}
                      {job.status === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => onRetry(job.id)}
                          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] motion-reduce:active:scale-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
                        >
                          <ReplayIcon sx={{ fontSize: 15 }} />
                          Retry
                        </button>
                      )}
                      <Tooltip title="Delete job" placement="top">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(job.id)}
                          color="error"
                          aria-label="Delete export job"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
