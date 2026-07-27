import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

import type { FormingTeamResponse } from "@/types/team.types";
import { getGradient, getInitials } from "../utils/teamVisuals";

const SECONDARY_BUTTON =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-blue-300 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:text-blue-400";

export function MemberDots({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          style={{ "--i": index } as React.CSSProperties}
          className={[
            "h-2 w-2 rounded-full transition-colors",
            index < count
              ? "pt-member-dot-filled bg-blue-500"
              : "bg-gray-200 dark:bg-slate-700",
          ].join(" ")}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold tabular-nums text-gray-500 dark:text-slate-400">
        {count}/{max}
      </span>
    </div>
  );
}

type JoinRequestDialogProps = {
  team: FormingTeamResponse | null;
  message: string;
  onMessageChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
  isError: boolean;
};

export function JoinRequestDialog({
  team,
  message,
  onMessageChange,
  onClose,
  onSubmit,
  isPending,
  isError,
}: JoinRequestDialogProps) {
  const ratio = Math.min(message.length / 1000, 1);
  const meterColor =
    message.length >= 1000
      ? "bg-rose-500"
      : message.length >= 900
        ? "bg-amber-500"
        : "bg-blue-500";

  return (
    <Dialog
      open={Boolean(team)}
      onClose={() => {
        if (!isPending) onClose();
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: { timeout: 240 },
        backdrop: {
          sx: { backdropFilter: "blur(3px)", transitionDuration: "240ms" },
        },
        paper: {
          className: "pt-dialog overflow-hidden rounded-3xl dark:bg-slate-900",
        },
      }}
    >
      {team && (
        <>
          <header className="pt-dialog-head relative overflow-hidden rounded-t-3xl bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_48%)]" />
            <div className="relative flex items-center gap-4 pr-10">
              <div className={`pt-dialog-avatar flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-base font-black text-white shadow-lg ${getGradient(team.name)}`}>
                {getInitials(team.name)}
              </div>
              <div className="pt-dialog-copy min-w-0 flex-1">
                <h2 className="truncate text-xl font-extrabold text-white">{team.name}</h2>
                <p className="mt-0.5 truncate text-xs text-white/70">Leader: {team.leaderName}</p>
              </div>
              <span className="pt-dialog-pill shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tabular-nums text-white backdrop-blur-sm">
                {team.memberCount}/{team.maxMembers}
              </span>
            </div>
            <IconButton
              aria-label="Close request dialog"
              disabled={isPending}
              onClick={onClose}
              className="absolute right-3 top-3 text-white disabled:text-white/40"
              size="small"
            >
              <CloseRoundedIcon />
            </IconButton>
          </header>

          <div className="space-y-4 bg-white px-6 py-5 dark:bg-slate-900">
            {(team.eventName || team.trackName) && (
              <div className="flex flex-wrap gap-2">
                {team.eventName && (
                  <span style={{ "--i": 0 } as React.CSSProperties} className="pt-dialog-chip rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {team.eventName}
                  </span>
                )}
                {team.trackName && (
                  <span style={{ "--i": 1 } as React.CSSProperties} className="pt-dialog-chip rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
                    {team.trackName}
                  </span>
                )}
              </div>
            )}

            <MemberDots count={team.memberCount} max={team.maxMembers} />

            <TextField
              autoFocus
              fullWidth
              multiline
              rows={4}
              label="Message to Leader (Optional)"
              placeholder="Introduce yourself and explain how you can contribute."
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              disabled={isPending}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                ".dark & .MuiOutlinedInput-root": {
                  color: "#e2e8f0",
                  backgroundColor: "#020617",
                },
                ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
                ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
              }}
            />

            <div>
              <div aria-hidden className="h-0.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full origin-left transition-transform duration-200 ${meterColor}`}
                  style={{ transform: `scaleX(${ratio})` }}
                />
              </div>
              <p className={`mt-1 text-right text-xs font-semibold tabular-nums ${message.length >= 1000 ? "text-rose-500" : message.length >= 900 ? "text-amber-500" : "text-slate-400"}`}>
                {message.length}/1000
              </p>
            </div>

            {isError && (
              <Alert className="pt-dialog-error" severity="error">
                The request could not be sent. Review the message and try again.
              </Alert>
            )}
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
            <button type="button" onClick={onClose} disabled={isPending} className={`${SECONDARY_BUTTON} disabled:cursor-not-allowed disabled:opacity-50`}>
              Cancel
            </button>
            <Button
              onClick={onSubmit}
              disabled={isPending}
              className="active:scale-95"
              sx={{
                minWidth: 132,
                borderRadius: "12px",
                px: 2.5,
                py: 1.25,
                color: "white",
                fontWeight: 800,
                background: "linear-gradient(90deg,#3b82f6,#6366f1)",
                boxShadow: "0 10px 22px rgba(59,130,246,.3)",
                "&:hover": { background: "linear-gradient(90deg,#2563eb,#4f46e5)" },
              }}
            >
              <span className="inline-flex items-center gap-2">
                {isPending && <CircularProgress size={15} color="inherit" />}
                {isPending ? "Sending..." : "Send Request"}
              </span>
            </Button>
          </footer>
        </>
      )}
    </Dialog>
  );
}
