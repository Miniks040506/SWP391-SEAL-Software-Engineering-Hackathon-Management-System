import { format } from "date-fns";
import { useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import Tooltip from "@mui/material/Tooltip";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import CircularProgress from "@mui/material/CircularProgress";
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

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export const ExportJobTable = ({ jobs, onDownload, onRetry, onDelete, isDownloading, isLoading }: Props) => {
  const [renderedAt] = useState(() => Date.now());

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <CircularProgress size={28} />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No export jobs yet. Create your first report from the cards above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Created</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">File</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => (
              <tr key={job.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                  <p className="font-medium">{format(new Date(job.requestedAt), "MMM dd, HH:mm")}</p>
                  {job.expiresAt && (
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Exp: {format(new Date(job.expiresAt), "MMM dd, yyyy")}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {job.exportType.replace(/_/g, " ")}
                  </p>
                  {job.params && (
                    <p
                      className="mt-0.5 max-w-[200px] truncate font-mono text-[10px] text-slate-400"
                      title={JSON.stringify(job.params)}
                    >
                      {Object.entries(job.params)
                        .filter(([, v]) => v !== undefined && v !== null)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <ExportStatusBadge status={job.status} />
                    {job.status === "FAILED" && job.errorMessage && (
                      <Tooltip title={job.errorMessage} placement="top" arrow>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 16, cursor: "help" }} />
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p
                    className="max-w-[180px] truncate font-medium text-slate-700 dark:text-slate-300"
                    title={job.fileName}
                  >
                    {job.fileName || "—"}
                  </p>
                  <div className="mt-0.5 flex gap-3 text-[10px] text-slate-400">
                    <span>{formatBytes(job.fileSizeBytes)}</span>
                    {job.rowCount !== undefined && <span>{job.rowCount.toLocaleString()} rows</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {job.status === "DONE" && (
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={() => onDownload(job.id)}
                        disabled={Boolean(
                          isDownloading ||
                            (job.expiresAt &&
                              new Date(job.expiresAt).getTime() <= renderedAt),
                        )}
                        startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "12px",
                          borderRadius: "8px",
                          boxShadow: "none",
                          px: 1.5,
                          py: 0.5,
                        }}
                      >
                        {job.expiresAt &&
                        new Date(job.expiresAt).getTime() <= renderedAt
                          ? "Expired"
                          : "Download"}
                      </Button>
                    )}
                    {job.status === "FAILED" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onRetry(job.id)}
                        startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "12px",
                          borderRadius: "8px",
                          px: 1.5,
                          py: 0.5,
                        }}
                      >
                        Retry
                      </Button>
                    )}
                    <Tooltip title="Delete job" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(job.id)}
                        color="error"
                        sx={{ ml: 0.5 }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
