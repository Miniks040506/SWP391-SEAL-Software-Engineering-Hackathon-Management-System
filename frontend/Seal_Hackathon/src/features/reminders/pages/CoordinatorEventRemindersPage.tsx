import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import AddAlertOutlinedIcon from "@mui/icons-material/AddAlertOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { useCoordinatorEventDetailQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import type { CreateReminderRequest, ReminderChannel, ReminderResponse, ReminderTargetScope, ReminderType } from "@/types/reminder.types";
import { useEventRemindersQuery } from "@/features/reminders/hooks/useReminderQueries";
import {
  useCreateReminderMutation,
  useGenerateDeadlineRemindersMutation,
  useSendReminderNowMutation,
} from "@/features/reminders/hooks/useReminderMutations";

const REMINDER_TYPES: Array<ReminderType | string> = [
  "DEADLINE_REMINDER",
  "SUBMISSION_REMINDER",
  "JUDGING_REMINDER",
  "CALIBRATION_REMINDER",
];

const TARGET_SCOPES: Array<ReminderTargetScope | string> = [
  "ALL_EVENT_USERS",
  "EVENT_PARTICIPANTS",
  "EVENT_MENTORS",
  "EVENT_JUDGES",
  "EVENT_COORDINATORS",
  "ROLE",
  "TRACK",
  "TEAM",
  "SINGLE_USER",
  "ROUND_JUDGES",
];

const CHANNELS: Array<ReminderChannel | string> = ["IN_APP", "EMAIL", "BOTH"];

function toLocalDateTimeValue(date = new Date(Date.now() + 60 * 60 * 1000)) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ReminderStatusChip({ status }: { status: string }) {
  const normalized = status?.toUpperCase?.() ?? "";
  const color = normalized === "SENT" ? "success" : normalized === "FAILED" ? "error" : normalized === "SCHEDULED" ? "primary" : "default";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Chip size="small" color={color as any} label={status || "DRAFT"} />;
}

function CreateReminderDialog({ open, onClose, onSubmit, isSubmitting }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReminderRequest) => void;
  isSubmitting: boolean;
}) {
  const [type, setType] = useState<string>("DEADLINE_REMINDER");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetScope, setTargetScope] = useState<string>("ALL_EVENT_USERS");
  const [targetId, setTargetId] = useState("");
  const [role, setRole] = useState("");
  const [channel, setChannel] = useState<string>("BOTH");
  const [scheduledAt, setScheduledAt] = useState(toLocalDateTimeValue());

  const canSubmit = title.trim() && body.trim() && scheduledAt.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      type,
      title: title.trim(),
      body: body.trim(),
      targetScope,
      targetId: targetId.trim() || undefined,
      role: role.trim() || undefined,
      channel,
      scheduledAt,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create reminder</DialogTitle>
      <DialogContent className="space-y-4 pt-3">
        <div className="grid gap-4 md:grid-cols-3">
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={(event) => setType(event.target.value)}>
              {REMINDER_TYPES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Target</InputLabel>
            <Select label="Target" value={targetScope} onChange={(event) => setTargetScope(event.target.value)}>
              {TARGET_SCOPES.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Channel</InputLabel>
            <Select label="Channel" value={channel} onChange={(event) => setChannel(event.target.value)}>
              {CHANNELS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
          </FormControl>
        </div>
        <TextField label="Title" size="small" fullWidth value={title} onChange={(event) => setTitle(event.target.value)} required />
        <TextField label="Body" size="small" fullWidth multiline minRows={4} value={body} onChange={(event) => setBody(event.target.value)} required />
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Scheduled at" size="small" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
          <TextField label="Target ID (optional)" size="small" value={targetId} onChange={(event) => setTargetId(event.target.value)} />
          <TextField label="Role (for ROLE target)" size="small" value={role} onChange={(event) => setRole(event.target.value)} placeholder="STUDENT / JUDGE / MENTOR" />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

function ReminderTable({ reminders, onSendNow, sendingId }: { reminders: ReminderResponse[]; onSendNow: (reminder: ReminderResponse) => void; sendingId?: string }) {
  if (reminders.length === 0) {
    return <Alert severity="info">No reminders yet. Create one manually or generate deadline reminders.</Alert>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead>
          <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Target</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Scheduled</th>
            <th className="px-4 py-3">Recipients</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {reminders.map((reminder) => (
            <tr key={reminder.id} className="align-top">
              <td className="max-w-sm px-4 py-4">
                <p className="font-bold text-slate-950 dark:text-white">{reminder.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{reminder.body}</p>
              </td>
              <td className="px-4 py-4"><Chip size="small" label={reminder.type} variant="outlined" /></td>
              <td className="px-4 py-4">{reminder.targetScope}</td>
              <td className="px-4 py-4">{reminder.channel}</td>
              <td className="px-4 py-4"><ReminderStatusChip status={reminder.status} /></td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleString() : "—"}</td>
              <td className="px-4 py-4">{reminder.recipientCount ?? 0}</td>
              <td className="px-4 py-4">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SendOutlinedIcon />}
                  disabled={sendingId === reminder.id || reminder.status === "SENT"}
                  onClick={() => onSendNow(reminder)}
                >
                  Send now
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CoordinatorEventRemindersPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [includeSubmission, setIncludeSubmission] = useState(true);
  const [includeJudging, setIncludeJudging] = useState(true);
  const [submissionDaysBefore, setSubmissionDaysBefore] = useState(1);
  const [judgingDaysBefore, setJudgingDaysBefore] = useState(1);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [sendingId, setSendingId] = useState<string>();

  const { data: event } = useCoordinatorEventDetailQuery(eventId);
  const { data: reminders = [], isLoading, isError, refetch, isFetching } = useEventRemindersQuery(eventId);
  const createMutation = useCreateReminderMutation();
  const generateMutation = useGenerateDeadlineRemindersMutation();
  const sendNowMutation = useSendReminderNowMutation();

  const sortedReminders = useMemo(
    () => [...reminders].sort((a, b) => String(b.scheduledAt ?? "").localeCompare(String(a.scheduledAt ?? ""))),
    [reminders],
  );

  if (!eventId) {
    return <Alert severity="warning">Choose an event first to manage reminders.</Alert>;
  }

  const handleCreate = async (payload: CreateReminderRequest) => {
    await createMutation.mutateAsync({ eventId, payload });
    setCreateOpen(false);
  };

  const handleGenerate = () => {
    generateMutation.mutate({
      eventId,
      payload: {
        submissionDaysBefore,
        judgingDaysBefore,
        includeSubmissionReminders: includeSubmission,
        includeJudgingReminders: includeJudging,
        emailEnabled,
      },
    });
  };

  const handleSendNow = async (reminder: ReminderResponse) => {
    setSendingId(reminder.id);
    try {
      await sendNowMutation.mutateAsync({ reminderId: reminder.id, eventId });
    } finally {
      setSendingId(undefined);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate(`/coordinator/events/${eventId}/edit`)} sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}>
            Back to event
          </Button>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950 dark:text-white">
            <AddAlertOutlinedIcon color="primary" fontSize="large" />
            Advanced Reminders
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Generate deadline reminders or create scheduled notification/email fanout for {event?.name ?? "this event"}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} disabled={isFetching} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddAlertOutlinedIcon />} onClick={() => setCreateOpen(true)}>
            Create reminder
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">Generate deadline reminders</h2>
              <p className="text-sm text-slate-500">Creates submission and judging reminders from event round deadlines.</p>
            </div>
            <Button variant="outlined" startIcon={<AutoFixHighOutlinedIcon />} onClick={handleGenerate} disabled={generateMutation.isPending}>
              Generate
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <Switch checked={includeSubmission} onChange={(event) => setIncludeSubmission(event.target.checked)} />
              <span className="text-sm font-semibold">Submission</span>
            </div>
            <TextField label="Days before submission" type="number" size="small" value={submissionDaysBefore} onChange={(event) => setSubmissionDaysBefore(Number(event.target.value))} />
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <Switch checked={includeJudging} onChange={(event) => setIncludeJudging(event.target.checked)} />
              <span className="text-sm font-semibold">Judging</span>
            </div>
            <TextField label="Days before judging" type="number" size="small" value={judgingDaysBefore} onChange={(event) => setJudgingDaysBefore(Number(event.target.value))} />
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <Switch checked={emailEnabled} onChange={(event) => setEmailEnabled(event.target.checked)} />
              <span className="text-sm font-semibold">Email</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><CircularProgress /></div>
      ) : isError ? (
        <Alert severity="error">Could not load reminders.</Alert>
      ) : (
        <ReminderTable reminders={sortedReminders} onSendNow={handleSendNow} sendingId={sendingId} />
      )}

      <CreateReminderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
