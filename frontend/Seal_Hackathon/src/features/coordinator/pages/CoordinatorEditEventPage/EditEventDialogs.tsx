import { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { DialogCancelBtn, DialogConfirmBtn } from "../../components/DialogButtons";
import { TeamStatusBadge } from "../../components/TeamStatusBadge";
import { avatarColor } from "@/utils/avatarColor";
import type { DialogState } from "../../hooks/useEditEventMutation";
import type { EventUser, ScoreCriteria, EventTeam } from "../../mocks/coordinatorEditEvent.mock";

// ─── Props ───────────────────────────────────────────────────────────────────

interface EditEventDialogsProps {
  dialog: DialogState;
  judges: EventUser[];
  mentors: EventUser[];
  criteria: ScoreCriteria[];
  onClose: () => void;
  onConfirmAddTrack: (name: string, desc: string) => void;
  onConfirmEditTrack: (name: string, desc: string) => void;
  onConfirmAddRound: (name: string, start: string, end: string) => void;
  onConfirmEditRound: (name: string, start: string, end: string) => void;
  onConfirmAddJudge: (selectedIds: string[]) => void;
  onConfirmAddMentor: (selectedIds: string[]) => void;
  onConfirmEditCriteria: (selectedIds: string[]) => void;
}

// ─── Style constants ──────────────────────────────────────────────────────────

const dialogPaperProps = {
  sx: { 
    borderRadius: "24px", 
    overflow: "hidden", 
    backgroundImage: "none" // Tắt hiệu ứng overlay trắng mặc định của MUI ở Dark Mode
  },
  className: "bg-white! dark:bg-[#1e293b]! border! border-slate-200! dark:border-slate-700/60! shadow-xl!"
};

const formInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s",
    "& fieldset": { borderColor: "transparent" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
    "&.Mui-focused": { backgroundColor: "#ffffff" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },

  ".dark & .MuiOutlinedInput-root": {
    backgroundColor: "#0f172a", 
    color: "#cbd5e1", 
    "& fieldset": { borderColor: "#334155" }, 
    "&:hover fieldset": { borderColor: "#475569" }, 
    "&.Mui-focused": { backgroundColor: "#1e293b", borderColor: "#3b82f6" },
  },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" }, 
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" }, 
  ".dark & .MuiSvgIcon-root": { color: "#94a3b8" }, 
};

const checkboxSx = {
  color: "#94a3b8",
  "&.Mui-checked": { color: "#3b82f6" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const EditEventDialogs = ({
  dialog,
  judges,
  mentors,
  criteria,
  onClose,
  onConfirmAddTrack,
  onConfirmEditTrack,
  onConfirmAddRound,
  onConfirmEditRound,
  onConfirmAddJudge,
  onConfirmAddMentor,
  onConfirmEditCriteria,
}: EditEventDialogsProps) => {

  // ── Track form state ──
  const [trackName, setTrackName] = useState("");
  const [trackDesc, setTrackDesc] = useState("");

  // ── Round form state ──
  const [roundName, setRoundName] = useState("");
  const [roundStart, setRoundStart] = useState("");
  const [roundEnd, setRoundEnd] = useState("");

  // ── Selection & Search state ──
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Cache States for Exit Animations (FIX FLICKERING BUG) ──
  // Lưu giữ lại loại popup và dữ liệu team để khi animation fade-out chạy, popup không bị vỡ giao diện
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<EventTeam | null>(null);

  useEffect(() => {
    if (dialog) {
      setDialogType(dialog.kind);
      if (dialog.kind === "teamDetail") {
        setActiveTeam(dialog.team);
      }
    }
    // Cố ý KHÔNG reset dialogType khi dialog = null để giữ giao diện ổn định lúc đóng
  }, [dialog]);

  // ── Sync local form state when dialog opens ──
  useEffect(() => {
    if (!dialog) return; // Chỉ reset khi MỞ dialog mới, không clear lúc ĐÓNG

    if (dialog.kind === "editTrack") {
      setTrackName(dialog.initialName ?? "");
      setTrackDesc(dialog.initialDesc ?? "");
    }
    if (dialog.kind === "addTrack") {
      setTrackName("");
      setTrackDesc("");
    }
    if (dialog.kind === "editRound") {
      setRoundName(dialog.initialName ?? "");
      setRoundStart(dialog.initialStart ?? "");
      setRoundEnd(dialog.initialEnd ?? "");
    }
    if (dialog.kind === "addRound") {
      setRoundName("");
      setRoundStart("");
      setRoundEnd("");
    }
    if (dialog.kind === "addJudge" || dialog.kind === "addMentor" || dialog.kind === "editCriteria") {
      setSelectedIds(dialog.initialSelectedIds ?? []);
      setSearchQuery("");
    }
  }, [dialog]);

  const toggleSelectId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── Renders ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Track Dialog (add + edit) */}
      <Dialog
        open={dialog?.kind === "addTrack" || dialog?.kind === "editTrack"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: dialogPaperProps }}
      >
        <DialogTitle className="text-lg! font-bold! text-slate-900! dark:text-slate-100!">
          {dialogType === "addTrack" ? "Create Track" : "Edit Track"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Track Name"
              placeholder="e.g. AI Track"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Description"
              placeholder="Brief description of the track"
              value={trackDesc}
              onChange={(e) => setTrackDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={formInputSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn
            onClick={() =>
              dialogType === "addTrack"
                ? onConfirmAddTrack(trackName, trackDesc)
                : onConfirmEditTrack(trackName, trackDesc)
            }
            disabled={!trackName.trim()}
            label={dialogType === "addTrack" ? "Create Track" : "Save Changes"}
          />
        </DialogActions>
      </Dialog>

      {/* Round Dialog (add + edit) */}
      <Dialog
        open={dialog?.kind === "addRound" || dialog?.kind === "editRound"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: dialogPaperProps }}
      >
        <DialogTitle className="text-lg! font-bold! text-slate-900! dark:text-slate-100!">
          {dialogType === "addRound" ? "Add Round" : "Edit Round"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Round Name"
              placeholder="e.g. Preliminary Round"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Start Date"
              type="date"
              value={roundStart}
              onChange={(e) => setRoundStart(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
            <TextField
              label="End Date"
              type="date"
              value={roundEnd}
              onChange={(e) => setRoundEnd(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn
            onClick={() =>
              dialogType === "addRound"
                ? onConfirmAddRound(roundName, roundStart, roundEnd)
                : onConfirmEditRound(roundName, roundStart, roundEnd)
            }
            disabled={!roundName.trim()}
            label={dialogType === "addRound" ? "Add Round" : "Save Changes"}
          />
        </DialogActions>
      </Dialog>

      {/* Judge / Mentor Assignment Dialog */}
      <Dialog
        open={dialog?.kind === "addJudge" || dialog?.kind === "addMentor"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: dialogPaperProps }}
      >
        <DialogTitle className="text-lg! font-bold! text-slate-900! dark:text-slate-100!">
          {dialogType === "addJudge" ? "Assign Judges" : "Assign Mentors"}
        </DialogTitle>
        <DialogContent dividers className="border-slate-100! dark:border-slate-700/50! p-0!">
          <div className="border-b border-slate-100 dark:border-slate-700/50 p-4">
            <TextField
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              sx={formInputSx}
            />
          </div>
          <div className="h-87.5 divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto p-2">
            {(dialogType === "addJudge" ? judges : mentors)
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelectId(user.id)}
                    sx={checkboxSx}
                  />
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.avatar[0] ?? "U")}`}
                  >
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </label>
              ))}
            {(dialogType === "addJudge" ? judges : mentors).filter(
              (u) =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="py-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn
            onClick={() =>
              dialogType === "addJudge"
                ? onConfirmAddJudge(selectedIds)
                : onConfirmAddMentor(selectedIds)
            }
            label="Save Assignments"
          />
        </DialogActions>
      </Dialog>

      {/* Scoring Criteria Dialog */}
      <Dialog
        open={dialog?.kind === "editCriteria"}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: dialogPaperProps }}
      >
        <DialogTitle className="text-lg! font-bold! text-slate-900! dark:text-slate-100!">
          Scoring Criteria
        </DialogTitle>
        <DialogContent dividers className="border-slate-100! dark:border-slate-700/50!">
          <div className="grid gap-3 pt-2">
            {criteria.map((criterion) => (
              <label
                key={criterion.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  selectedIds.includes(criterion.id)
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/40"
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(criterion.id)}
                  onChange={() => toggleSelectId(criterion.id)}
                  sx={{ ...checkboxSx, mt: -1 }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{criterion.name}</p>
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                      {criterion.maxScore} pts
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{criterion.description}</p>
                </div>
              </label>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <span className="mr-auto px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {selectedIds.length} criteria selected
          </span>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn
            onClick={() => onConfirmEditCriteria(selectedIds)}
            label="Save Criteria"
          />
        </DialogActions>
      </Dialog>

      {/* Team Detail Dialog */}
      <Dialog
        open={dialog?.kind === "teamDetail"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: dialogPaperProps }}
      >
        <DialogTitle>
          {activeTeam && (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${avatarColor(activeTeam.name[0])}`}
              >
                {activeTeam.name[0]}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{activeTeam.name}</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Registered {activeTeam.registeredAt}
                </p>
              </div>
            </div>
          )}
        </DialogTitle>
        <DialogContent dividers className="border-slate-100! dark:border-slate-700/50!">
          {activeTeam && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Team Members
                </h3>
                <TeamStatusBadge status={activeTeam.status} />
              </div>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/40">
                {activeTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColor(member.name[0])}`}
                      >
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{member.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    {member.role === "Leader" && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <DialogConfirmBtn onClick={onClose} label="Close" />
        </DialogActions>
      </Dialog>
    </>
  );
};