import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useEditEvent } from "../../hooks/useEditEvent";
import { EditEventDialogs } from "./EditEventDialogs";
import { InfoTab } from "./InfoTab";
import { TeamsTab } from "./TeamsTab";
import { TracksTab } from "./TracksTab";

const TABS = ["info", "tracks", "teams"] as const;

export type TabId = typeof TABS[number];

const TAB_LABELS: Record<TabId, string> = {
  info: "Basic Information",
  tracks: "Tracks & Rounds",
  teams: "Participating Teams",
};

export const CoordinatorEditEventPage = () => {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    event,
    teams,
    expandedTracks,
    dialog,
    setDialog,
    selectedIds,
    selectedTeamIds,
    newRoundName,
    setNewRoundName,
    newRoundStart,
    setNewRoundStart,
    newRoundEnd,
    setNewRoundEnd,
    newTrackName,
    setNewTrackName,
    newTrackDesc,
    setNewTrackDesc,
    isSaving,
    errors,
    pendingCount,
    closeDialog,
    handleSave,
    handleDiscard,
    handleEventChange,
    toggleExpand,
    removeTrack,
    removeRound,
    removeUser,
    openAddJudge,
    openAddMentor,
    openEditCriteria,
    openAddRound,
    openAddTrack,
    confirmAddRound,
    confirmAddTrack,
    confirmAddJudge,
    confirmAddMentor,
    confirmEditCriteria,
    toggleSelectId,
    updateTeamStatus,
    handleSelectAllTrackTeams,
    handleToggleSelectTeam,
    handleBulkTeamStatusUpdate,
    openEditTrack,
    openEditRound,
    confirmEditTrack,
    confirmEditRound,
  } = useEditEvent();

  return (
    <div className="w-full bg-slate-50/50 pb-8 font-sans text-slate-900">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={() => navigate("/coordinator/events")}
              className="!bg-slate-100 !text-slate-600 hover:!bg-slate-200 transition-colors"
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
              onClick={handleDiscard}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="mb-8 flex space-x-1 border-b border-slate-200">
          {TABS.map((id) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative px-5 py-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {TAB_LABELS[id]}
                  {id === "teams" && pendingCount > 0 && (
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

        <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500">
          {activeTab === "info" && (
            <InfoTab
              event={event}
              errors={errors}
              onChange={handleEventChange}
            />
          )}

          {activeTab === "tracks" && (
            <TracksTab
              event={event}
              expandedTracks={expandedTracks}
              onToggleExpand={toggleExpand}
              onRemoveTrack={removeTrack}
              onRemoveRound={removeRound}
              onRemoveUser={removeUser}
              onOpenAddJudge={openAddJudge}
              onOpenAddMentor={openAddMentor}
              onOpenAddRound={openAddRound}
              onOpenEditCriteria={openEditCriteria}
              onOpenAddTrack={openAddTrack}
              onOpenEditTrack={openEditTrack}
              onOpenEditRound={openEditRound}
            />
          )}

          {activeTab === "teams" && (
            <TeamsTab
              event={event}
              teams={teams}
              selectedTeamIds={selectedTeamIds}
              onUpdateTeamStatus={updateTeamStatus}
              onSelectAll={handleSelectAllTrackTeams}
              onToggleSelect={handleToggleSelectTeam}
              onBulkUpdate={handleBulkTeamStatusUpdate}
              onOpenTeamDetail={(team) =>
                setDialog({ kind: "teamDetail", team })
              }
            />
          )}
        </div>
      </div>

      <EditEventDialogs
        dialog={dialog}
        selectedIds={selectedIds}
        newRoundName={newRoundName}
        newRoundStart={newRoundStart}
        newRoundEnd={newRoundEnd}
        newTrackName={newTrackName}
        newTrackDesc={newTrackDesc}
        onClose={closeDialog}
        onToggleSelectId={toggleSelectId}
        onSetNewRoundName={setNewRoundName}
        onSetNewRoundStart={setNewRoundStart}
        onSetNewRoundEnd={setNewRoundEnd}
        onSetNewTrackName={setNewTrackName}
        onSetNewTrackDesc={setNewTrackDesc}
        onConfirmAddTrack={confirmAddTrack}
        onConfirmAddRound={confirmAddRound}
        onConfirmAddJudge={confirmAddJudge}
        onConfirmAddMentor={confirmAddMentor}
        onConfirmEditCriteria={confirmEditCriteria}
        onConfirmEditTrack={confirmEditTrack}
        onConfirmEditRound={confirmEditRound}
      />
    </div>
  );
};