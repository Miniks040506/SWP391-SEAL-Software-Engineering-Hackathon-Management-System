import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

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
} from '../mocks/coordinatorEditEvent.mock';

type TabId = 'info' | 'tracks' | 'teams';

type DialogState =
  | { kind: 'addJudge';     trackId: string }
  | { kind: 'addMentor';    trackId: string }
  | { kind: 'addRound';     trackId: string }
  | { kind: 'editCriteria'; trackId: string; roundId: string }
  | { kind: 'addTrack' }
  | { kind: 'teamDetail';   team: EventTeam }
  | null;

const AVATAR_COLORS: Record<string, string> = {
  N: 'bg-blue-50 text-blue-600 border border-blue-100',
  T: 'bg-violet-50 text-violet-600 border border-violet-100',
  L: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  P: 'bg-orange-50 text-orange-600 border border-orange-100',
  H: 'bg-rose-50 text-rose-600 border border-rose-100',
  D: 'bg-amber-50 text-amber-600 border border-amber-100',
  V: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
  B: 'bg-pink-50 text-pink-600 border border-pink-100',
};
const avatarColor = (initial: string) => AVATAR_COLORS[initial] ?? 'bg-slate-50 text-slate-600 border border-slate-100';

// Custom Style cho Mui Input đồng bộ Theme
const formInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#2563eb' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' }
};

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
    {children}
  </div>
);

const UserPill = ({ name, initials, onRemove }: { name: string; initials: string; onRemove?: () => void }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50/50 py-0.5 pl-1 pr-2 text-xs font-medium text-slate-700">
    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${avatarColor(initials)}`}>
      {initials}
    </span>
    {name}
    {onRemove && (
      <button type="button" onClick={onRemove} className="ml-1 text-slate-400 hover:text-slate-600 text-sm">
        ×
      </button>
    )}
  </span>
);

const TeamStatusBadge = ({ status }: { status: EventTeam['status'] }) => {
  const styles = {
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    PENDING:  'bg-amber-50 text-amber-600 border-amber-200',
    REJECTED: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
};

export const CoordinatorEditEventPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState<TabId>('info');
  const [event, setEvent]                 = useState<EditEventData>(editEventMock);
  const [teams, setTeams]                 = useState<EventTeam[]>(eventTeamsMock);
  const [expandedTracks, setExpanded]     = useState<Record<string, boolean>>(
    Object.fromEntries(editEventMock.tracks.map((t) => [t.id, true])),
  );
  const [dialog, setDialog]               = useState<DialogState>(null);
  const [selectedIds, setSelectedIds]     = useState<string[]>([]);
  const [newRoundName, setNewRoundName]   = useState('');
  const [newRoundStart, setNewRoundStart] = useState('');
  const [newRoundEnd, setNewRoundEnd]     = useState('');
  const [newTrackName, setNewTrackName]   = useState('');
  const [newTrackDesc, setNewTrackDesc]   = useState('');

  const pendingCount = teams.filter((t) => t.status === 'PENDING').length;

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const removeTrack = (trackId: string) => setEvent((prev) => ({ ...prev, tracks: prev.tracks.filter((t) => t.id !== trackId) }));
  
  const removeRound = (trackId: string, roundId: string) =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => t.id === trackId ? { ...t, rounds: t.rounds.filter((r) => r.id !== roundId) } : t),
    }));

  const removeUser = (trackId: string, userId: string, field: 'judgeIds' | 'mentorIds') =>
    setEvent((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => t.id === trackId ? { ...t, [field]: t[field].filter((id) => id !== userId) } : t),
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

  const confirmAddRound = () => {
    if (dialog?.kind !== 'addRound' || !newRoundName) return;
    const newRound: EventRound = {
      id: `round-${Date.now()}`,
      name: newRoundName,
      startDate: newRoundStart,
      endDate: newRoundEnd,
      criteriaIds: [],
    };
    setEvent((prev) => ({ ...prev, tracks: prev.tracks.map((t) => t.id === dialog.trackId ? { ...t, rounds: [...t.rounds, newRound] } : t) }));
    setDialog(null);
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
    setDialog(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Bar Minimalist */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/coordinator/events')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Edit Event</p>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">{event.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/coordinator/events')}
            className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Discard
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Modern Tabs Pill */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        {(['info', 'tracks', 'teams'] as const).map((id) => {
          const labels: Record<TabId, string> = { info: 'Event Info', tracks: 'Tracks & Rounds', teams: 'Teams' };
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {labels[id]}
              {id === 'teams' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Event Info */}
      {activeTab === 'info' && (
        <SectionCard>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">Basic Information</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField label="Event Name" defaultValue={event.name} fullWidth size="small" sx={formInputSx} />
            <TextField label="Season" select defaultValue={event.season} fullWidth size="small" sx={formInputSx}>
              {['Spring', 'Summer', 'Fall'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
              label="Description" defaultValue={event.description}
              fullWidth size="small" multiline rows={3} className="md:col-span-2" sx={formInputSx}
            />
            <TextField
              label="Start Date" type="date" defaultValue={event.startDate}
              fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} sx={formInputSx}
            />
            <TextField
              label="End Date" type="date" defaultValue={event.endDate}
              fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} sx={formInputSx}
            />
          </div>
        </SectionCard>
      )}

      {/* Tab: Tracks & Rounds */}
      {activeTab === 'tracks' && (
        <div className="space-y-4">
          {event.tracks.map((track) => (
            <SectionCard key={track.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(track.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"
                  >
                    {expandedTracks[track.id] ? <ExpandLessOutlinedIcon sx={{ fontSize: 14 }} /> : <ExpandMoreOutlinedIcon sx={{ fontSize: 14 }} />}
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{track.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{track.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTrack(track.id)}
                  className="rounded-md p-1 text-slate-400 hover:text-red-500 transition"
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>

              {expandedTracks[track.id] && (
                <div className="mt-4 space-y-4 border-t border-slate-50 pt-4">
                  {/* Judges */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">
                      <GradingOutlinedIcon sx={{ fontSize: 13 }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Judges</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {track.judgeIds.map((jid) => {
                        const u = availableJudges.find((j) => j.id === jid);
                        return u ? (
                          <UserPill key={jid} name={u.name} initials={u.avatar} onRemove={() => removeUser(track.id, jid, 'judgeIds')} />
                        ) : null;
                      })}
                      <button
                        type="button"
                        onClick={() => openAddJudge(track.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs text-slate-500 hover:border-blue-500 hover:text-blue-600 transition"
                      >
                        <PersonAddOutlinedIcon sx={{ fontSize: 11 }} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Mentors */}
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-slate-400">
                      <SchoolOutlinedIcon sx={{ fontSize: 13 }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Mentors</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {track.mentorIds.map((mid) => {
                        const u = availableMentors.find((m) => m.id === mid);
                        return u ? (
                          <UserPill key={mid} name={u.name} initials={u.avatar} onRemove={() => removeUser(track.id, mid, 'mentorIds')} />
                        ) : null;
                      })}
                      <button
                        type="button"
                        onClick={() => openAddMentor(track.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs text-slate-500 hover:border-blue-500 hover:text-blue-600 transition"
                      >
                        <PersonAddOutlinedIcon sx={{ fontSize: 11 }} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Rounds Inline-List */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rounds</span>
                      <button
                        type="button"
                        onClick={() => { setNewRoundName(''); setNewRoundStart(''); setNewRoundEnd(''); setDialog({ kind: 'addRound', trackId: track.id }); }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add Round
                      </button>
                    </div>

                    {track.rounds.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-100 py-4 text-center text-xs text-slate-400">
                        No rounds yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 border-t border-slate-50">
                        {track.rounds.map((round) => (
                          <div key={round.id} className="flex items-center justify-between py-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">{round.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{round.startDate} → {round.endDate}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {round.criteriaIds.map((cid) => {
                                  const c = availableScoreCriteria.find((x) => x.id === cid);
                                  return c ? (
                                    <span key={cid} className="rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                      {c.name}
                                    </span>
                                  ) : null;
                                })}
                                <button
                                  type="button"
                                  onClick={() => openEditCriteria(track.id, round.id)}
                                  className="text-[10px] text-blue-500 font-medium hover:underline ml-1"
                                >
                                  Edit criteria
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRound(track.id, round.id)}
                              className="text-slate-300 hover:text-red-500 p-1"
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                            </button>
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
            onClick={() => { setNewTrackName(''); setNewTrackDesc(''); setDialog({ kind: 'addTrack' }); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3.5 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20 transition"
          >
            <AddOutlinedIcon sx={{ fontSize: 14 }} /> Add New Track
          </button>
        </div>
      )}

      {/* Tab: Teams Minimal List */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {event.tracks.map((track) => {
            const trackTeams = teams.filter((t) => t.trackId === track.id);
            if (trackTeams.length === 0) return null;
            return (
              <SectionCard key={track.id}>
                <div className="mb-3 flex items-center gap-2 border-b border-slate-50 pb-2">
                  <GroupsOutlinedIcon sx={{ fontSize: 15, color: '#64748b' }} />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{track.name}</h3>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {trackTeams.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {trackTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between py-3 first:pt-1 last:pb-1">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${avatarColor(team.name[0])}`}>
                          {team.name[0]}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setDialog({ kind: 'teamDetail', team })}
                            className="text-xs font-semibold text-slate-800 hover:text-blue-600"
                          >
                            {team.name}
                          </button>
                          <p className="text-[11px] text-slate-400">
                            {team.members.length} members · {team.registeredAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TeamStatusBadge status={team.status} />
                        {team.status === 'PENDING' ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: 'APPROVED' } : t))}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: 'REJECTED' } : t))}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 border border-slate-200 hover:text-red-500 hover:border-red-100 rounded-md transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: t.status === 'APPROVED' ? 'REJECTED' : 'APPROVED' } : t))}
                            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-0.5"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Shared Dialog Component */}
      <Dialog
        open={dialog?.kind === 'addTrack'}
        onClose={() => setDialog(null)}
        maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '12px', boxShadow: 'none' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>Add Track</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4 pt-1">
            <TextField label="Track Name" placeholder="e.g. AI Track" value={newTrackName} onChange={(e) => setNewTrackName(e.target.value)} fullWidth size="small" sx={formInputSx} />
            <TextField label="Description" placeholder="Short description" value={newTrackDesc} onChange={(e) => setNewTrackDesc(e.target.value)} fullWidth size="small" multiline rows={2} sx={formInputSx} />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={confirmAddTrack} disabled={!newTrackName} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Add</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};