import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
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

export const AuditLogDetailDrawer = ({ log, onClose }: Props) => {
  const handleCopy = (text: string) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const CopyButton = ({ text }: { text?: string }) => {
    if (!text) return null;
    return (
      <IconButton size="small" onClick={() => handleCopy(text)} title="Copy to clipboard">
        <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} className="text-slate-400 hover:text-blue-500" />
      </IconButton>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(log)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "100%", sm: "600px", md: "800px" }, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }
        }
      }}
    >
      {log && (
        <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Audit Log Detail</h2>
              <Chip label={log.actionType} size="small" sx={{ fontWeight: 800, fontSize: "11px" }} color="primary" />
            </div>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Actor</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{log.actorName || "System"}</span>
                  <span className="text-xs font-mono text-slate-500">{log.actorId}</span>
                  <CopyButton text={log.actorId} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                <span className="font-bold text-slate-900 dark:text-white">
                  {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                <div className="flex items-center gap-2">
                  <Chip label={log.targetTable} size="small" variant="outlined" />
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{log.targetId}</span>
                  <CopyButton text={log.targetId} />
                </div>
              </div>
            </div>

            {/* Context */}
            {hasAuditValue(log.context) && (
              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Execution Context</h3>
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <pre className="overflow-x-auto text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {formatAuditValue(log.context)}
                  </pre>
                </div>
              </div>
            )}

            {/* State Changes */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-bold text-rose-600">Before State</h3>
                <div className="h-64 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
                  <pre className="text-xs font-mono text-rose-900 dark:text-rose-200 whitespace-pre-wrap">
                    {formatAuditValue(log.beforeState)}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-bold text-emerald-600">After State</h3>
                <div className="h-64 overflow-y-auto rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                  <pre className="text-xs font-mono text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                    {formatAuditValue(log.afterState)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4 text-right dark:border-slate-800 dark:bg-slate-900">
            <Button
              onClick={onClose}
              variant="contained"
              disableElevation
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
