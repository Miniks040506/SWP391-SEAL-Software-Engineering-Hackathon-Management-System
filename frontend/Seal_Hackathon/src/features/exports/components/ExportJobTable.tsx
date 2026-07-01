import { format } from "date-fns";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import Tooltip from "@mui/material/Tooltip";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import type { ExportJobResponse } from "@/types/export.types";
import { ExportStatusBadge } from "./ExportStatusBadge";

type Props = {
  jobs: ExportJobResponse[];
  onDownload: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  isDownloading?: boolean;
};

function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const ExportJobTable = ({ jobs, onDownload, onRetry, onDelete, isDownloading }: Props) => {
  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
        No export jobs found. Create your first report from the cards above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="p-4 font-extrabold">Created At</th>
            <th className="p-4 font-extrabold">Type & Params</th>
            <th className="p-4 font-extrabold">Status</th>
            <th className="p-4 font-extrabold">File details</th>
            <th className="p-4 font-extrabold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {jobs.map((job) => (
            <tr key={job.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="p-4 whitespace-nowrap font-medium">
                {format(new Date(job.requestedAt), "MMM dd, HH:mm")}
                {job.expiresAt && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Exp: {format(new Date(job.expiresAt), "MMM dd")}
                  </p>
                )}
              </td>
              <td className="p-4">
                <span className="font-bold text-slate-900 dark:text-white">{job.exportType.replace(/_/g, " ")}</span>
                <p className="text-[10px] text-slate-500 font-mono mt-1 max-w-xs truncate" title={JSON.stringify(job.params)}>
                  {Object.entries(job.params || {})
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ")}
                </p>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <ExportStatusBadge status={job.status} />
                  {job.status === "FAILED" && job.errorMessage && (
                    <Tooltip title={job.errorMessage} placement="top">
                      <ErrorOutlineIcon color="error" fontSize="small" className="cursor-help" />
                    </Tooltip>
                  )}
                </div>
              </td>
              <td className="p-4">
                <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={job.fileName || "-"}>
                  {job.fileName || "-"}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                  <span>{formatBytes(job.fileSizeBytes)}</span>
                  {job.rowCount !== undefined && <span>{job.rowCount} rows</span>}
                </div>
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                {job.status === "DONE" && (
                  <Button
                    size="small"
                    variant="contained"
                    disableElevation
                    onClick={() => onDownload(job.id)}
                    disabled={isDownloading}
                    startIcon={<DownloadIcon />}
                    sx={{ textTransform: "none", fontWeight: 700, mr: 1, borderRadius: 2 }}
                  >
                    Download
                  </Button>
                )}
                {job.status === "FAILED" && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onRetry(job.id)}
                    startIcon={<ReplayIcon />}
                    sx={{ textTransform: "none", fontWeight: 700, mr: 1, borderRadius: 2 }}
                  >
                    Retry
                  </Button>
                )}
                <IconButton size="small" onClick={() => onDelete(job.id)} color="error" title="Delete job">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
