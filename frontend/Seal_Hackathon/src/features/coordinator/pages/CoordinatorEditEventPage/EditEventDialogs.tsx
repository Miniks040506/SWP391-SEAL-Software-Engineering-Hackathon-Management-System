import { useState, useEffect } from "react";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { DialogCancelBtn, DialogConfirmBtn } from "../../components/DialogButtons";
import { TeamStatusBadge } from "../../components/TeamStatusBadge";
import {
  availableJudges,
  availableMentors,
  availableScoreCriteria,
} from "../../mocks/coordinatorEditEvent.mock";
import { avatarColor } from "@/utils/avatarColor";
import type { DialogState } from "../../hooks/useEditEvent";

interface EditEventDialogsProps {
  dialog: DialogState;
  selectedIds: string[];
  newRoundName: string;
  newRoundStart: string;
  newRoundEnd: string;
  newTrackName: string;
  newTrackDesc: string;
  onClose: () => void;
  onToggleSelectId: (id: string) => void;
  onSetNewRoundName: (v: string) => void;
  onSetNewRoundStart: (v: string) => void;
  onSetNewRoundEnd: (v: string) => void;
  onSetNewTrackName: (v: string) => void;
  onSetNewTrackDesc: (v: string) => void;
  onConfirmAddTrack: () => void;
  onConfirmAddRound: () => void;
  onConfirmAddJudge: () => void;
  onConfirmAddMentor: () => void;
  onConfirmEditCriteria: () => void;
  onConfirmEditTrack: () => void;
  onConfirmEditRound: () => void;
}

const dialogPaperSx = {
  borderRadius: "24px",
  overflow: "hidden",
};

const formInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
  },
};

const checkboxSx = {
  color: "#94a3b8",
  "&.Mui-checked": {
    color: "#3b82f6",
  },
};

export const EditEventDialogs = ({
  dialog,
  selectedIds,
  newRoundName,
  newRoundStart,
  newRoundEnd,
  newTrackName,
  newTrackDesc,
  onClose,
  onToggleSelectId,
  onSetNewRoundName,
  onSetNewRoundStart,
  onSetNewRoundEnd,
  onSetNewTrackName,
  onSetNewTrackDesc,
  onConfirmAddTrack,
  onConfirmAddRound,
  onConfirmAddJudge,
  onConfirmAddMentor,
  onConfirmEditCriteria,
  onConfirmEditTrack,
  onConfirmEditRound,
}: EditEventDialogsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!dialog) {
      setSearchQuery("");
    }
  }, [dialog]);

  return (
    <>
      <Dialog
        open={dialog?.kind === "addTrack" || dialog?.kind === "editTrack"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", color: "#0f172a" }}>
          {dialog?.kind === "addTrack" ? "Create Track" : "Edit Track"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Track Name"
              placeholder="e.g. AI Track"
              value={newTrackName}
              onChange={(e) => onSetNewTrackName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Description"
              placeholder="Brief description of the track"
              value={newTrackDesc}
              onChange={(e) => onSetNewTrackDesc(e.target.value)}
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
            onClick={dialog?.kind === "addTrack" ? onConfirmAddTrack : onConfirmEditTrack}
            disabled={!newTrackName.trim()}
            label={dialog?.kind === "addTrack" ? "Create Track" : "Save Changes"}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.kind === "addRound" || dialog?.kind === "editRound"}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", color: "#0f172a" }}>
          {dialog?.kind === "addRound" ? "Add Round" : "Edit Round"}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Round Name"
              placeholder="e.g. Preliminary Round"
              value={newRoundName}
              onChange={(e) => onSetNewRoundName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Start Date"
              type="date"
              value={newRoundStart}
              onChange={(e) => onSetNewRoundStart(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
            <TextField
              label="End Date"
              type="date"
              value={newRoundEnd}
              onChange={(e) => onSetNewRoundEnd(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn
            onClick={dialog?.kind === "addRound" ? onConfirmAddRound : onConfirmEditRound}
            disabled={!newRoundName.trim()}
            label={dialog?.kind === "addRound" ? "Add Round" : "Save Changes"}
          />
        </DialogActions>
      </Dialog>

      {(dialog?.kind === "addJudge" || dialog?.kind === "addMentor") && (
        <Dialog
          open
          onClose={onClose}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: dialogPaperSx } }}
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", color: "#0f172a" }}>
            {dialog.kind === "addJudge" ? "Assign Judges" : "Assign Mentors"}
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: "#f1f5f9", padding: 0 }}>
            <div className="border-b border-slate-100 p-4">
              <TextField
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                size="small"
                sx={formInputSx}
              />
            </div>
            <div className="h-[350px] divide-y divide-slate-100 overflow-y-auto p-2">
              {(dialog.kind === "addJudge" ? availableJudges : availableMentors)
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onChange={() => onToggleSelectId(user.id)}
                      sx={checkboxSx}
                    />
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.avatar[0] ?? "U")}`}
                    >
                      {user.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs font-medium text-slate-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              {(dialog.kind === "addJudge" ? availableJudges : availableMentors).filter(
                (u) =>
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="py-6 text-center text-sm font-medium text-slate-500">
                  No users found matching "{searchQuery}"
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <DialogCancelBtn onClick={onClose} />
            <DialogConfirmBtn
              onClick={dialog.kind === "addJudge" ? onConfirmAddJudge : onConfirmAddMentor}
              label="Save Assignments"
            />
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={dialog?.kind === "editCriteria"}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: dialogPaperSx } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", color: "#0f172a" }}>
          Scoring Criteria
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
          <div className="grid gap-3">
            {availableScoreCriteria.map((criterion) => (
              <label
                key={criterion.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  selectedIds.includes(criterion.id)
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(criterion.id)}
                  onChange={() => onToggleSelectId(criterion.id)}
                  sx={{ ...checkboxSx, mt: -1 }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{criterion.name}</p>
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                      {criterion.maxScore} pts
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">{criterion.description}</p>
                </div>
              </label>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <span className="mr-auto px-4 text-xs font-medium text-slate-500">
            {selectedIds.length} criteria selected
          </span>
          <DialogCancelBtn onClick={onClose} />
          <DialogConfirmBtn onClick={onConfirmEditCriteria} label="Save Criteria" />
        </DialogActions>
      </Dialog>

      {dialog?.kind === "teamDetail" && (
        <Dialog
          open
          onClose={onClose}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: dialogPaperSx } }}
        >
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${avatarColor(dialog.team.name[0])}`}
              >
                {dialog.team.name[0]}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{dialog.team.name}</h2>
                <p className="text-xs font-medium text-slate-500">
                  Registered {dialog.team.registeredAt}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Team Members
                </h3>
                <TeamStatusBadge status={dialog.team.status} />
              </div>
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {dialog.team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColor(member.name[0])}`}
                      >
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs font-medium text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    {member.role === "Leader" && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <DialogConfirmBtn onClick={onClose} label="Close" />
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};