import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import Chip from "@mui/material/Chip";
import { format } from "date-fns";
import type { AuditLogResponse } from "@/types/system.types";

type Props = {
  log: AuditLogResponse | null;
  onClose: () => void;
};

function hasAuditValue(value: unknown) {
  return value !== null && value !== undefined;
}

function formatAuditValue(value: unknown) {
  if (!hasAuditValue(value)) return "Null / Not applicable";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function CopyButton({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <IconButton
      size="small"
      onClick={() => navigator.clipboard.writeText(text)}
      title="Copy to clipboard"
    >
      <ContentCopyOutlinedIcon
        sx={{ fontSize: 14 }}
        className="text-slate-400 hover:text-blue-500"
      />
    </IconButton>
  );
}

export const AuditLogDetailDrawer = ({ log, onClose }: Props) => {
  return (
    <Dialog
      open={Boolean(log)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="audit-log-detail-title"
      slotProps={{
        paper: {
          sx: {
            height: { xs: "100dvh", sm: "min(88dvh, 860px)" },
            maxHeight: { xs: "100dvh", sm: "88dvh" },
            margin: { xs: 0, sm: 4 },
            borderRadius: { xs: 0, sm: 3 },
            overflow: "hidden",
            backgroundImage: "none",
          },
        },
      }}
    >
      {log && (
        <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 bg-linear-to-r from-slate-950 to-blue-950 p-5">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <ManageSearchOutlinedIcon />
              </span>
              <h2
                id="audit-log-detail-title"
                className="text-xl font-black text-white"
              >
                Audit log detail
              </h2>
              <Chip
                label={log.actionType}
                size="small"
                sx={{
                  maxWidth: { xs: 180, sm: "none" },
                  fontWeight: 800,
                  fontSize: "11px",
                }}
                color="primary"
              />
            </div>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="Close audit log detail"
              className="text-white! hover:bg-white/10!"
            >
              <CloseIcon />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Information */}
            <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Actor
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.actorName || "System"}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {log.actorId}
                  </span>
                  <CopyButton text={log.actorId} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Time
                </p>
                <span className="font-bold text-slate-900 dark:text-white">
                  {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  IP Address
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {log.ipAddress || "Not captured"}
                  </span>
                  <CopyButton text={log.ipAddress ?? undefined} />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  User Agent
                </p>
                <div className="flex items-center gap-2">
                  <span className="break-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {log.userAgent || "Not captured"}
                  </span>
                  <CopyButton text={log.userAgent ?? undefined} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Target
                </p>
                <div className="flex items-center gap-2">
                  <Chip
                    label={log.targetTable}
                    size="small"
                    variant="outlined"
                  />
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {log.targetId}
                  </span>
                  <CopyButton text={log.targetId} />
                </div>
              </div>
            </div>

            {/* Context */}
            {hasAuditValue(log.context) && (
              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">
                  Execution Context
                </h3>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <pre className="overflow-x-auto text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {formatAuditValue(log.context)}
                  </pre>
                </div>
              </div>
            )}

            {/* State Changes */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-bold text-rose-600">
                  Before State
                </h3>
                <div className="h-64 overflow-y-auto rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                  <pre className="text-xs font-mono text-rose-900 dark:text-rose-200 whitespace-pre-wrap">
                    {formatAuditValue(log.beforeState)}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-emerald-600">
                  After State
                </h3>
                <div className="h-64 overflow-y-auto rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                  <pre className="text-xs font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                    {formatAuditValue(log.afterState)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4 text-right dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
