import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';

import {
  availableJudges,
  availableMentors,
  availableScoreCriteria,
  editEventMock,
  eventTeamsMock,
  type EditEventData,
  type EventRound,
  type EventTeam,
  type EventTrack,
} from '../../mocks/coordinatorEditEvent.mock';

type TabId = 'info' | 'tracks' | 'teams';

type DialogState =
  | { kind: 'addJudge'; trackId: string }
  | { kind: 'addMentor'; trackId: string }
  | { kind: 'addRound'; trackId: string }
  | { kind: 'editCriteria'; trackId: string; roundId: string }
  | { kind: 'addTrack' }
  | { kind: 'teamDetail'; team: EventTeam }
  | null;

const AVATAR_COLORS: Record<string, string> = {
  N: 'bg-blue-100 text-blue-700',
  T: 'bg-violet-100 text-violet-700',
  L: 'bg-emerald-100 text-emerald-700',
  P: 'bg-orange-100 text-orange-700',
  H: 'bg-rose-100 text-rose-700',
  D: 'bg-amber-100 text-amber-700',
  V: 'bg-cyan-100 text-cyan-700',
  B: 'bg-pink-100 text-pink-700',
};

const avatarColor = (initial: string) =>
  AVATAR_COLORS[initial.toUpperCase()] ?? 'bg-slate-100 text-slate-700';

const formInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
    '&.Mui-focused': { backgroundColor: '#ffffff' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
};

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

const UserPill = ({
  name,
  initials,
  onRemove,
}: {
  name: string;
  initials: string;
  onRemove?: () => void;
}) => (
  <span className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow">
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${avatarColor(initials[0] || 'X')}`}
    >
      {initials}
    </span>
    {name}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
      >
        ×
      </button>
    )}
  </span>
);

const TeamStatusBadge = ({ status }: { status: EventTeam['status'] }) => {
  const styles = {
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
};

const DialogCancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
  >
    Cancel
  </button>
);

const DialogConfirmBtn = ({
  onClick,
  disabled,
  label = 'Confirm',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all"
  >
    {label}
  </button>
);

export const CoordinatorEditEventPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [event, setEvent] = useState<EditEventData>(editEventMock);
  const [teams, setTeams] = useState<EventTeam[]>(eventTeamsMock);
  const [expandedTracks, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(editEventMock.tracks.map((t) => [t.id, true])),
  );
  const [dialog, setDialog] = useState<DialogState>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundStart, setNewRoundStart] = useState('');
  const [newRoundEnd, setNewRoundEnd] = useState('');

  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');

  const pendingCount = useMemo(() => teams.filter((t) => t.status === 'PENDING').length, [teams]);

  const closeDialog = () => setDialog(null);

  const handleEventChange = (field: keyof EditEventData, value: string) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const removeTrack = (trackId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));

  const removeRound = (trackId: string, roundId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, rounds: t.rounds.filter((r) => r.id !== roundId) }
          : t,
      ),
    }));

  const removeUser = (trackId: string, userId: string, field: 'judgeIds' | 'mentorIds') =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? { ...t, [field]: t[field].filter((id) => id !== userId) }
          : t,
      ),
    }));

  const openAddJudge = (trackId: string) => {
    setSelectedIds([...(event.tracks.find((t) => t.id === trackId)?.judgeIds ?? [])]);
    setDialog({ kind: 'addJudge', trackId });
  };

  const openAddMentor = (trackId: string) => {
    setSelectedIds([...(event.tracks.find((t) => t.id === trackId)?.mentorIds ?? [])]);
    setDialog({ kind: 'addMentor', trackId });
  };

  const openEditCriteria = (trackId: string, roundId: string) => {
    const round = event.tracks.find((t) => t.id === trackId)?.rounds.find((r) => r.id === roundId);
    setSelectedIds([...(round?.criteriaIds ?? [])]);
    setDialog({ kind: 'editCriteria', trackId, roundId });
  };

  const openAddRound = (trackId: string) => {
    setNewRoundName('');
    setNewRoundStart('');
    setNewRoundEnd('');
    setDialog({ kind: 'addRound', trackId });
  };

  const openAddTrack = () => {
    setNewTrackName('');
    setNewTrackDesc('');
    setDialog({ kind: 'addTrack' });
  };

  const confirmAddRound = () => {
    if (dialog?.kind !== 'addRound' || !newRoundName) return;
    const newRound: EventRound = {
      id: `round-${Date.now()}`,
      name: newRoundName,
      startDate: newRoundStart,
      endDate: newRoundEnd,
      criteriaIds: [],
    };
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId ? { ...t, rounds: [...t.rounds, newRound] } : t,
      ),
    }));
    closeDialog();
  };

  const confirmAddTrack = () => {
    if (!newTrackName) return;
    const newTrack: EventTrack = {
      id: `track-${Date.now()}`,
      name: newTrackName,
      description: newTrackDesc,
      judgeIds: [],
      mentorIds: [],
      rounds: [],
    };
    setEvent((prev) => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
    setExpanded((prev) => ({ ...prev, [newTrack.id]: true }));
    closeDialog();
  };

  const confirmAddJudge = () => {
    if (dialog?.kind !== 'addJudge') return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === dialog.trackId ? { ...t, judgeIds: selectedIds } : t)),
    }));
    closeDialog();
  };

  const confirmAddMentor = () => {
    if (dialog?.kind !== 'addMentor') return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === dialog.trackId ? { ...t, mentorIds: selectedIds } : t)),
    }));
    closeDialog();
  };

  const confirmEditCriteria = () => {
    if (dialog?.kind !== 'editCriteria') return;
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === dialog.trackId
          ? {
              ...t,
              rounds: t.rounds.map((r) =>
                r.id === dialog.roundId ? { ...r, criteriaIds: selectedIds } : r,
              ),
            }
          : t,
      ),
    }));
    closeDialog();
  };

  const toggleSelectId = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const updateTeamStatus = (teamId: string, status: EventTeam['status']) =>
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, status } : t)));

  const handleSelectAllTrackTeams = (trackId: string, checked: boolean) => {
    const trackTeamIds = teams.filter((t) => t.trackId === trackId).map((t) => t.id);
    if (checked) {
      setSelectedTeamIds((prev) => Array.from(new Set([...prev, ...trackTeamIds])));
    } else {
      setSelectedTeamIds((prev) => prev.filter((id) => !trackTeamIds.includes(id)));
    }
  };

  const handleToggleSelectTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId],
    );
  };

  const handleBulkTeamStatusUpdate = (trackId: string, status: EventTeam['status']) => {
    const trackTeamIds = teams.filter((t) => t.trackId === trackId).map((t) => t.id);
    const toUpdate = selectedTeamIds.filter((id) => trackTeamIds.includes(id));

    setTeams((prev) => prev.map((t) => (toUpdate.includes(t.id) ? { ...t, status } : t)));
    setSelectedTeamIds((prev) => prev.filter((id) => !toUpdate.includes(id)));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={() => navigate('/coordinator/events')}
              className="!bg-slate-100 hover:!bg-slate-200 !text-slate-600 transition-colors"
              size="small"
            >
              <ArrowBackOutlinedIcon fontSize="small" />
            </IconButton>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Event Editor
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                {event.name}
              </h1>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/coordinator/events')}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="mb-8 flex space-x-1 border-b border-slate-200">
          {(['info', 'tracks', 'teams'] as const).map((id) => {
            const labels: Record<TabId, string> = {
              info: 'Basic Information',
              tracks: 'Tracks & Rounds',
              teams: 'Participating Teams',
            };
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative px-5 py-3 text-sm font-bold transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {labels[id]}
                  {id === 'teams' && pendingCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-amber-500 px-2 text-[10px] font-black text-white">
                      {pendingCount} NEW
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
          {activeTab === 'info' && (
            <SectionCard className="max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CalendarTodayOutlinedIcon fontSize="small" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Event Details</h2>
                  <p className="text-sm text-slate-500">Manage the core information for this event.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TextField
                  label="Event Name"
                  value={event.name}
                  onChange={(e) => handleEventChange('name', e.target.value)}
                  fullWidth
                  sx={formInputSx}
                />
                <TextField
                  label="Season"
                  select
                  value={event.season}
                  onChange={(e) => handleEventChange('season', e.target.value)}
                  fullWidth
                  sx={formInputSx}
                >
                  {['Spring', 'Summer', 'Fall'].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Description"
                  value={event.description}
                  onChange={(e) => handleEventChange('description', e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  className="md:col-span-2"
                  sx={formInputSx}
                />
                <TextField
                  label="Start Date"
                  type="date"
                  value={event.startDate}
                  onChange={(e) => handleEventChange('startDate', e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={formInputSx}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={event.endDate}
                  onChange={(e) => handleEventChange('endDate', e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={formInputSx}
                />
              </div>
            </SectionCard>
          )}

          {activeTab === 'tracks' && (
            <div className="space-y-6">
              {event.tracks.map((track) => (
                <SectionCard key={track.id} className="p-0 overflow-hidden transition-all hover:shadow-md border-slate-200">
                  <div className="flex items-center justify-between bg-slate-50/50 px-6 py-5 cursor-pointer" onClick={() => toggleExpand(track.id)}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${expandedTracks[track.id] ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}>
                        {expandedTracks[track.id] ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{track.name}</h3>
                        <p className="text-sm text-slate-500">{track.description}</p>
                      </div>
                    </div>
                    <IconButton onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }} size="small" className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50">
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </div>

                  {expandedTracks[track.id] && (
                    <div className="px-6 py-6 border-t border-slate-200 bg-white space-y-8">
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                              <GradingOutlinedIcon fontSize="small" className="text-indigo-500" />
                              Assigned Judges
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {track.judgeIds.map((jid) => {
                              const u = availableJudges.find((j) => j.id === jid);
                              return u ? (
                                <UserPill
                                  key={jid}
                                  name={u.name}
                                  initials={u.avatar}
                                  onRemove={() => removeUser(track.id, jid, 'judgeIds')}
                                />
                              ) : null;
                            })}
                            <button
                              type="button"
                              onClick={() => openAddJudge(track.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <PersonAddOutlinedIcon sx={{ fontSize: 16 }} /> Add Judge
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                              <SchoolOutlinedIcon fontSize="small" className="text-teal-500" />
                              Assigned Mentors
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {track.mentorIds.map((mid) => {
                              const u = availableMentors.find((m) => m.id === mid);
                              return u ? (
                                <UserPill
                                  key={mid}
                                  name={u.name}
                                  initials={u.avatar}
                                  onRemove={() => removeUser(track.id, mid, 'mentorIds')}
                                />
                              ) : null;
                            })}
                            <button
                              type="button"
                              onClick={() => openAddMentor(track.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-500 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                            >
                              <PersonAddOutlinedIcon sx={{ fontSize: 16 }} /> Add Mentor
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-bold text-slate-700">Track Rounds</h4>
                          <button
                            type="button"
                            onClick={() => openAddRound(track.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-blue-50 transition-colors"
                          >
                            <AddOutlinedIcon fontSize="small" /> Add Round
                          </button>
                        </div>

                        {track.rounds.length === 0 ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-10 text-slate-400">
                            <CalendarTodayOutlinedIcon className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">No rounds created yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {track.rounds.map((round) => (
                              <div
                                key={round.id}
                                className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between transition-all hover:shadow-md"
                              >
                                <div>
                                  <h5 className="font-bold text-slate-800">{round.name}</h5>
                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {round.startDate} &nbsp;→&nbsp; {round.endDate}
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {round.criteriaIds.map((cid) => {
                                      const c = availableScoreCriteria.find((x) => x.id === cid);
                                      return c ? (
                                        <span
                                          key={cid}
                                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                                        >
                                          {c.name}
                                        </span>
                                      ) : null;
                                    })}
                                    <button
                                      type="button"
                                      onClick={() => openEditCriteria(track.id, round.id)}
                                      className="rounded-md px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                      + Manage Criteria
                                    </button>
                                  </div>
                                </div>
                                <IconButton
                                  onClick={() => removeRound(track.id, round.id)}
                                  className="!text-slate-300 hover:!text-red-500 hover:!bg-red-50 self-start sm:self-auto"
                                >
                                  <DeleteOutlineOutlinedIcon fontSize="small" />
                                </IconButton>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </SectionCard>
              ))}

              <button
                type="button"
                onClick={openAddTrack}
                className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-200 group-hover:bg-blue-100">
                  <AddOutlinedIcon fontSize="small" />
                </div>
                <span className="font-bold text-sm">Add New Track</span>
              </button>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              {event.tracks.map((track) => {
                const trackTeams = teams.filter((t) => t.trackId === track.id);
                if (trackTeams.length === 0) return null;

                const trackTeamIds = trackTeams.map((t) => t.id);
                const selectedInTrack = selectedTeamIds.filter((id) => trackTeamIds.includes(id));
                const isAllSelected = selectedInTrack.length > 0 && selectedInTrack.length === trackTeamIds.length;
                const isIndeterminate = selectedInTrack.length > 0 && selectedInTrack.length < trackTeamIds.length;

                return (
                  <SectionCard key={track.id} className="overflow-hidden p-0">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isIndeterminate}
                          onChange={(e) => handleSelectAllTrackTeams(track.id, e.target.checked)}
                          sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' }, '&.MuiCheckbox-indeterminate': { color: '#3b82f6' } }}
                        />
                        <GroupsOutlinedIcon className="text-slate-400" />
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
                          {track.name}
                        </h3>
                        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                          {trackTeams.length}
                        </span>
                      </div>
                      
                      {selectedInTrack.length > 0 && (
                        <div className="flex items-center gap-2 px-2 animate-in fade-in zoom-in-95 duration-200">
                          <span className="mr-2 text-xs font-bold text-slate-500">
                            {selectedInTrack.length} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => handleBulkTeamStatusUpdate(track.id, 'APPROVED')}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                          >
                            <DoneAllOutlinedIcon sx={{ fontSize: 14 }} /> Approve All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkTeamStatusUpdate(track.id, 'REJECTED')}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <BlockOutlinedIcon sx={{ fontSize: 14 }} /> Reject All
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {trackTeams.map((team) => (
                        <div
                          key={team.id}
                          className={`flex flex-col gap-4 p-4 pl-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                            selectedTeamIds.includes(team.id) ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedTeamIds.includes(team.id)}
                              onChange={() => handleToggleSelectTeam(team.id)}
                              sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' } }}
                            />
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black shadow-sm border border-slate-100 ${avatarColor(team.name[0])}`}>
                              {team.name[0]}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setDialog({ kind: 'teamDetail', team })}
                                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                              >
                                {team.name}
                              </button>
                              <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span>{team.members.length} Members</span>
                                <span>•</span>
                                <span>Registered {team.registeredAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pl-12 sm:pl-0 sm:flex-row-reverse">
                            <div className="w-24 text-right">
                              <TeamStatusBadge status={team.status} />
                            </div>

                            <div className="flex items-center gap-2">
                              {team.status === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'APPROVED')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                                  >
                                    <CheckOutlinedIcon sx={{ fontSize: 14 }} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'REJECTED')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                                  >
                                    <CloseOutlinedIcon sx={{ fontSize: 14 }} /> Reject
                                  </button>
                                </>
                              )}

                              {team.status === 'APPROVED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'REJECTED')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 transition-colors"
                                  >
                                    <CloseOutlinedIcon sx={{ fontSize: 14 }} /> Reject Team
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'PENDING')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                  >
                                    <ReplayOutlinedIcon sx={{ fontSize: 14 }} /> Reset to Pending
                                  </button>
                                </>
                              )}

                              {team.status === 'REJECTED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'APPROVED')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:ring-emerald-200 transition-colors"
                                  >
                                    <CheckOutlinedIcon sx={{ fontSize: 14 }} /> Approve Team
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateTeamStatus(team.id, 'PENDING')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                  >
                                    <ReplayOutlinedIcon sx={{ fontSize: 14 }} /> Reset to Pending
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={dialog?.kind === 'addTrack'}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Create Track</DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Track Name"
              placeholder="e.g. AI Track"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Description"
              placeholder="Brief description of the track"
              value={newTrackDesc}
              onChange={(e) => setNewTrackDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={formInputSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <DialogCancelBtn onClick={closeDialog} />
          <DialogConfirmBtn onClick={confirmAddTrack} disabled={!newTrackName.trim()} label="Create Track" />
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog?.kind === 'addRound'}
        onClose={closeDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Add Round</DialogTitle>
        <DialogContent>
          <div className="space-y-5 pt-2">
            <TextField
              label="Round Name"
              placeholder="e.g. Preliminary Round"
              value={newRoundName}
              onChange={(e) => setNewRoundName(e.target.value)}
              fullWidth
              sx={formInputSx}
            />
            <TextField
              label="Start Date"
              type="date"
              value={newRoundStart}
              onChange={(e) => setNewRoundStart(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
            <TextField
              label="End Date"
              type="date"
              value={newRoundEnd}
              onChange={(e) => setNewRoundEnd(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={formInputSx}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <DialogCancelBtn onClick={closeDialog} />
          <DialogConfirmBtn onClick={confirmAddRound} disabled={!newRoundName.trim()} label="Add Round" />
        </DialogActions>
      </Dialog>

      {(dialog?.kind === 'addJudge' || dialog?.kind === 'addMentor') && (
        <Dialog
          open
          onClose={closeDialog}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>
            {dialog.kind === 'addJudge' ? 'Assign Judges' : 'Assign Mentors'}
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
            <div className="divide-y divide-slate-100">
              {(dialog.kind === 'addJudge' ? availableJudges : availableMentors).map((user) => (
                <label
                  key={user.id}
                  className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3 hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelectId(user.id)}
                    sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' } }}
                  />
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.avatar[0] || 'U')}`}>
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <DialogCancelBtn onClick={closeDialog} />
            <DialogConfirmBtn
              onClick={dialog.kind === 'addJudge' ? confirmAddJudge : confirmAddMentor}
              label="Save Assignments"
            />
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={dialog?.kind === 'editCriteria'}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>Scoring Criteria</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <div className="grid gap-3">
            {availableScoreCriteria.map((criteria) => (
              <label
                key={criteria.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  selectedIds.includes(criteria.id)
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(criteria.id)}
                  onChange={() => toggleSelectId(criteria.id)}
                  sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#3b82f6' }, mt: -1 }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{criteria.name}</p>
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                      {criteria.maxScore} pts
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{criteria.description}</p>
                </div>
              </label>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <span className="mr-auto px-4 text-xs font-semibold text-slate-500">
            {selectedIds.length} criteria selected
          </span>
          <DialogCancelBtn onClick={closeDialog} />
          <DialogConfirmBtn onClick={confirmEditCriteria} label="Save Criteria" />
        </DialogActions>
      </Dialog>

      {dialog?.kind === 'teamDetail' && (
        <Dialog
          open
          onClose={closeDialog}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${avatarColor(dialog.team.name[0])}`}>
                {dialog.team.name[0]}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{dialog.team.name}</h2>
                <p className="text-xs font-medium text-slate-500">Registered {dialog.team.registeredAt}</p>
              </div>
            </div>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Team Members</h3>
                <TeamStatusBadge status={dialog.team.status} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                {dialog.team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColor(member.name[0])}`}>
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    {member.role === 'Leader' && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <DialogConfirmBtn onClick={closeDialog} label="Close" />
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};