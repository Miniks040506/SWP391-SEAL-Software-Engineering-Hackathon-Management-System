import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { AuditLogResponse } from "@/types/system.types";

type Props = {
  log: AuditLogResponse | null;
  onClose: () => void;
};

export const AuditLogDetailModal = ({ log, onClose }: Props) => {
  if (!log) return null;

  return (
    <Dialog
      open={Boolean(log)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <span className="font-extrabold text-slate-900 dark:text-white">
          Audit Log Detail
        </span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="bg-slate-50 dark:bg-slate-900">
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Actor</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {log.actorName || "System"}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Action Type</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {log.actionType}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Target Table</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {log.targetTable}{" "}
              <span className="text-xs font-mono text-slate-400 ml-1">
                {log.targetId}
              </span>
            </p>
          </div>
          
          {log.context && (
            <div>
              <p className="text-slate-500 mb-1">Context</p>
              <pre className="font-mono text-xs text-slate-600 dark:text-slate-400">
                {JSON.stringify(log.context)}
              </pre>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
            <h4 className="mb-2 font-black text-rose-600">Before State</h4>
            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {log.beforeState
                ? JSON.stringify(log.beforeState, null, 2)
                : "Null / Not applicable"}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
            <h4 className="mb-2 font-black text-emerald-600">After State</h4>
            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {log.afterState
                ? JSON.stringify(log.afterState, null, 2)
                : "Null / Not applicable"}
            </pre>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "8px",
            bgcolor: "#2563eb",
          }}
        >
          Close Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};
