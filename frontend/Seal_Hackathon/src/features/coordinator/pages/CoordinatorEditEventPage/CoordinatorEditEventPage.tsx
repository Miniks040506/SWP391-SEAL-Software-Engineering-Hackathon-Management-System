import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useEditEventMutation } from "../../hooks/useEditEventMutation";
import { EditEventDialogs } from "./EditEventDialogs";
import { InfoTab } from "./InfoTab";
import { TeamsTab } from "./TeamsTab";
import { TracksTab } from "./TracksTab";
import { CriteriaTab } from "./CriteriaTab";
import type { TabId } from "../../hooks/useEditEventMutation";
import {
  availableJudges,
  availableMentors,
  availableScoreCriteria,
} from "../../mocks/coordinatorEditEvent.mock";

const TABS: TabId[] = ["info", "tracks", "criteria", "teams"];

const TAB_LABELS: Record<TabId, string> = {
  info: "Basic Information",
  tracks: "Tracks & Rounds",
  criteria: "Scoring Criteria",
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
    selectedTeamIds,
    isSaving,
    errors,
    pendingCount,
    closeDialog,
    openAddTrack,
    openEditTrack,
    openAddRound,
    openEditRound,
    openAddJudge,
    openAddMentor,
    openEditCriteria,
    openTeamDetail,
    confirmAddTrack,
    confirmEditTrack,
    confirmAddRound,
    confirmEditRound,
    confirmAddJudge,
    confirmAddMentor,
    confirmEditCriteria,
    handleSave,
    handleDiscard,
    handleEventChange,
    toggleExpand,
    removeTrack,
    removeRound,
    removeMentor,
    removeJudge,
    updateTeamStatus,
    handleSelectAllTrackTeams,
    handleToggleSelectTeam,
    handleBulkTeamStatusUpdate,
  } = useEditEventMutation();

  return (
    <div className="w-full bg-slate-50/50 pb-8 font-sans text-slate-900 dark:bg-transparent dark:text-slate-200 min-h-[calc(100vh-4rem)]">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-slate-800/50 dark:bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={() => navigate("/coordinator/events")}
              className="bg-slate-100! text-slate-600! hover:bg-slate-200! dark:bg-slate-800! dark:text-slate-400! dark:hover:bg-slate-700! transition-colors"
              size="small"
            >
              <ArrowBackOutlinedIcon fontSize="small" />
            </IconButton>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Event Editor
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-300">
                {event.name}
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50 dark:bg-transparent dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-500! dark:text-white! dark:hover:bg-blue-400!"
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
        <div className="mb-8 flex space-x-1 border-b border-slate-200 dark:border-slate-700">
          {TABS.map((id) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`relative px-5 py-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {TAB_LABELS[id]}
                  {id === "teams" && pendingCount > 0 && (
                    <span className="flex h-5 items-center justify-center rounded-full bg-blue-100 px-2 text-[10px] font-black text-blue-600 dark:bg-blue-500/20! dark:text-blue-400!">
                      {pendingCount} NEW
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-t-full bg-blue-600 dark:bg-blue-500" />
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
              onRemoveMentor={removeMentor}
              onRemoveJudge={removeJudge}
              onOpenAddJudge={openAddJudge}
              onOpenAddMentor={openAddMentor}
              onOpenAddRound={openAddRound}
              onOpenEditTrack={openEditTrack}
              onOpenEditRound={openEditRound}
              onOpenAddTrack={openAddTrack}
            />
          )}

          {activeTab === "criteria" && <CriteriaTab />}

          {activeTab === "teams" && (
            <TeamsTab
              event={event}
              teams={teams}
              selectedTeamIds={selectedTeamIds}
              onUpdateTeamStatus={updateTeamStatus}
              onSelectAll={handleSelectAllTrackTeams}
              onToggleSelect={handleToggleSelectTeam}
              onBulkUpdate={handleBulkTeamStatusUpdate}
              onOpenTeamDetail={openTeamDetail}
            />
          )}
        </div>
      </div>

      <EditEventDialogs
        dialog={dialog}
        judges={availableJudges}
        mentors={availableMentors}
        criteria={availableScoreCriteria}
        onClose={closeDialog}
        onConfirmAddTrack={confirmAddTrack}
        onConfirmEditTrack={confirmEditTrack}
        onConfirmAddRound={confirmAddRound}
        onConfirmEditRound={confirmEditRound}
        onConfirmAddJudge={confirmAddJudge}
        onConfirmAddMentor={confirmAddMentor}
        onConfirmEditCriteria={confirmEditCriteria}
      />
    </div>
  );
};