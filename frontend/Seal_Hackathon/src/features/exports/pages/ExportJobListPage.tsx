import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import {
  menuPropsAll,
  paginationSx,
  selectSx,
  textFieldSx,
} from "@/features/admin/schemas/admin.schema";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/utils/roleRedirect";
import type { UUID } from "@/types/common.types";
import type {
  EventExportRequest,
  ExportJobResponse,
} from "@/types/export.types";
import type { TrackResponse } from "@/types/track.types";
import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventsQuery,
  useCoordinatorEventTracksQuery,
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { ExportJobTable } from "../components/ExportJobTable";
import { ExportReportCard } from "../components/ExportReportCard";
import {
  useCreateGenericExport,
  useCreateRankingExport,
  useCreateScoresExport,
  useCreateTeamListExport,
  useDeleteExport,
  useDownloadExport,
  useExportJobsQuery,
  useRetryExport,
} from "../hooks/useExports";

type SelectOption = { id: string; name: string };

function ScopeSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={selectSx}
        MenuProps={menuPropsAll}
      >
        <MenuItem value="">{allLabel}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ExportSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          size="small"
        />
      }
      label={
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
      }
      sx={{ m: 0 }}
    />
  );
}

export const ExportJobListPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = getPrimaryRole(user) === "ADMIN";
  const [page, setPage] = useState(0);
  const [manualEventId, setManualEventId] = useState("");
  const activeEventId = eventId || manualEventId;

  const eventQuery = useCoordinatorEventDetailQuery(
    eventId as UUID | undefined,
  );
  const eventName = eventQuery.data?.name;
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useCoordinatorEventsQuery({ page: 0, size: 100 });
  const events = eventsData?.content || eventsData || [];
  const eventList = Array.isArray(events) ? events : [];

  const {
    data: jobsData,
    isLoading,
    isFetching,
    isError: isJobsError,
    refetch,
  } = useExportJobsQuery({ page, size: 10 });
  const { mutate: createRanking, isPending: isRankingPending } =
    useCreateRankingExport();
  const { mutate: createScore, isPending: isScorePending } =
    useCreateScoresExport();
  const { mutate: createTeam, isPending: isTeamPending } =
    useCreateTeamListExport();
  const { mutate: createFullEventExport, isPending: isFullEventPending } =
    useCreateGenericExport();
  const { mutate: createCalibrationExport, isPending: isCalibrationPending } =
    useCreateGenericExport();
  const { mutate: createAnnualExport, isPending: isAnnualPending } =
    useCreateGenericExport();
  const { mutate: downloadExport, isPending: isDownloading } =
    useDownloadExport();
  const { mutate: retryExport } = useRetryExport();
  const { mutate: deleteExport } = useDeleteExport();

  const tracksQuery = useCoordinatorEventTracksQuery(
    activeEventId as UUID | undefined,
  );
  const roundsQuery = useCoordinatorEventRoundsQuery(
    activeEventId as UUID | undefined,
  );
  const tracks: TrackResponse[] = Array.isArray(tracksQuery.data)
    ? tracksQuery.data
    : [];
  const rounds = roundsQuery.data || [];

  const [rankingDisqualified, setRankingDisqualified] = useState(false);
  const [rankingTrackId, setRankingTrackId] = useState("");
  const [rankingRoundId, setRankingRoundId] = useState("");
  const [scoreDrafts, setScoreDrafts] = useState(false);
  const [scoreAnonymize, setScoreAnonymize] = useState(true);
  const [scoreDisqualified, setScoreDisqualified] = useState(false);
  const [scoreTrackId, setScoreTrackId] = useState("");
  const [scoreRoundId, setScoreRoundId] = useState("");
  const [teamTrackId, setTeamTrackId] = useState("");
  const [annualYear, setAnnualYear] = useState(
    String(new Date().getFullYear()),
  );
  const [annualSeason, setAnnualSeason] = useState("");

  const downloadCreatedExport = (job: ExportJobResponse) => {
    setPage(0);
    if (job.status === "DONE") downloadExport(job.id);
  };

  const handleCreateRanking = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: "XLSX",
      includeDisqualified: rankingDisqualified,
      ...(rankingTrackId && { trackId: rankingTrackId as UUID }),
      ...(rankingRoundId && { roundId: rankingRoundId as UUID }),
    };
    createRanking(
      { eventId: activeEventId as UUID, payload },
      { onSuccess: downloadCreatedExport },
    );
  };

  const handleCreateScore = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: "XLSX",
      includeDraftScores: scoreDrafts,
      anonymize: scoreAnonymize,
      includeDisqualified: scoreDisqualified,
      ...(scoreTrackId && { trackId: scoreTrackId as UUID }),
      ...(scoreRoundId && { roundId: scoreRoundId as UUID }),
    };
    createScore(
      { eventId: activeEventId as UUID, payload },
      { onSuccess: downloadCreatedExport },
    );
  };

  const handleCreateTeam = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: "XLSX",
      ...(teamTrackId && { trackId: teamTrackId as UUID }),
    };
    createTeam(
      { eventId: activeEventId as UUID, payload },
      { onSuccess: downloadCreatedExport },
    );
  };

  const handleCreateFullEvent = () => {
    if (!activeEventId) return;
    createFullEventExport(
      {
        exportType: "FULL_EVENT_REPORT",
        params: { eventId: activeEventId as UUID, format: "XLSX" },
      },
      { onSuccess: downloadCreatedExport },
    );
  };

  const handleCreateCalibration = () => {
    if (!activeEventId) return;
    createCalibrationExport(
      {
        exportType: "CALIBRATION_REPORT",
        params: { eventId: activeEventId as UUID, format: "XLSX" },
      },
      { onSuccess: downloadCreatedExport },
    );
  };

  const handleCreateAnnual = () => {
    const parsedYear = annualYear.trim() ? Number(annualYear) : undefined;
    createAnnualExport(
      {
        exportType: "ADMIN_ANNUAL_REPORT",
        params: {
          format: "XLSX",
          ...(Number.isFinite(parsedYear) && { year: parsedYear }),
          ...(annualSeason && { season: annualSeason }),
        },
      },
      { onSuccess: downloadCreatedExport },
    );
  };

  const jobs = jobsData?.content || [];
  const totalJobs = jobsData?.totalElements ?? jobs.length;
  const totalPages = jobsData?.totalPages || 0;
  const readyJobs = jobs.filter((job) => job.status === "DONE").length;
  const activeJobs = jobs.filter(
    (job) => job.status === "QUEUED" || job.status === "PROCESSING",
  ).length;
  const failedJobs = jobs.filter((job) => job.status === "FAILED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow={isAdmin ? "Administration Workspace" : "Coordinator Workspace"}
        title="Report"
        accentTitle="Exports"
        description={
          eventName
            ? `Create and manage Excel workbooks for ${eventName}.`
            : "Create event workbooks and manage previous export jobs from one workspace."
        }
        icon={<FileDownloadOutlinedIcon sx={{ fontSize: 34 }} />}
        actions={
          <>
            {eventId && (
              <button
                type="button"
                onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] motion-reduce:active:scale-100"
              >
                <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
                Event setup
              </button>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
              {isFetching ? "Refreshing" : "Refresh"}
            </button>
          </>
        }
      />

      <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        {[
          ["Total jobs", totalJobs],
          ["Ready on page", readyJobs],
          ["In progress", activeJobs],
          ["Failed on page", failedJobs],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`px-5 py-4 ${index ? "border-t border-slate-200 sm:border-t-0 sm:border-l dark:border-slate-800" : ""}`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950 tabular-nums dark:text-white">
              {isLoading ? "-" : value}
            </p>
          </div>
        ))}
      </section>

      {isJobsError && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 sm:flex-row sm:items-center sm:justify-between dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <span>
            Export jobs could not be loaded. Existing exports are unchanged.
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer font-black underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      {eventId && eventQuery.isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          The selected event could not be loaded. Return to Events and confirm
          it still exists.
        </div>
      )}

      {!eventId && (
        <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <TuneOutlinedIcon sx={{ fontSize: 21 }} />
            </span>
            <div>
              <h2 className="font-black text-slate-950 dark:text-white">
                {isAdmin ? "Event export scope" : "Choose an event"}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Select an event to enable event reports. Existing jobs remain
                available below.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            {isEventsError ? (
              <button
                type="button"
                onClick={() => refetchEvents()}
                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-amber-300 px-4 text-sm font-bold text-amber-700 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-500/50 dark:text-amber-300 dark:hover:bg-amber-500/10"
              >
                Retry event loading
              </button>
            ) : (
              <FormControl size="small" className="w-full lg:w-80">
                <InputLabel>Target event</InputLabel>
                <Select
                  label="Target event"
                  value={manualEventId}
                  onChange={(event) => setManualEventId(event.target.value)}
                  disabled={isLoadingEvents}
                  sx={selectSx}
                  MenuProps={menuPropsAll}
                >
                  {isLoadingEvents && (
                    <MenuItem value="" disabled>
                      Loading events
                    </MenuItem>
                  )}
                  {!isLoadingEvents && eventList.length === 0 && (
                    <MenuItem value="" disabled>
                      No events found
                    </MenuItem>
                  )}
                  {eventList.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </section>
      )}

      {activeEventId && (tracksQuery.isError || roundsQuery.isError) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Some event filters could not be loaded. You can export without a track
          or round filter.
        </div>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Create a report
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reports are saved to export history and downloaded when processing
            completes.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ExportReportCard
            title="Ranking report"
            description="Final ranking rows with score, rank, advancement and publish state."
            icon={<WorkspacePremiumOutlinedIcon fontSize="small" />}
            onExport={handleCreateRanking}
            isExporting={isRankingPending}
            disabled={!activeEventId || isDownloading}
            controls={
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <ScopeSelect
                    label="Track"
                    allLabel="All tracks"
                    value={rankingTrackId}
                    options={tracks}
                    onChange={setRankingTrackId}
                  />
                  <ScopeSelect
                    label="Round"
                    allLabel="All rounds"
                    value={rankingRoundId}
                    options={rounds}
                    onChange={setRankingRoundId}
                  />
                </div>
                <ExportSwitch
                  label="Include disqualified teams"
                  checked={rankingDisqualified}
                  onChange={setRankingDisqualified}
                />
              </div>
            }
          />

          <ExportReportCard
            title="Score report"
            description="Score rows by judge, submission and criterion for internal review."
            icon={<AssessmentOutlinedIcon fontSize="small" />}
            onExport={handleCreateScore}
            isExporting={isScorePending}
            disabled={!activeEventId || isDownloading}
            controls={
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <ScopeSelect
                    label="Track"
                    allLabel="All tracks"
                    value={scoreTrackId}
                    options={tracks}
                    onChange={setScoreTrackId}
                  />
                  <ScopeSelect
                    label="Round"
                    allLabel="All rounds"
                    value={scoreRoundId}
                    options={rounds}
                    onChange={setScoreRoundId}
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <ExportSwitch
                    label="Include draft scores"
                    checked={scoreDrafts}
                    onChange={setScoreDrafts}
                  />
                  <ExportSwitch
                    label="Include disqualified teams"
                    checked={scoreDisqualified}
                    onChange={setScoreDisqualified}
                  />
                  <ExportSwitch
                    label="Anonymize judges"
                    checked={scoreAnonymize}
                    onChange={setScoreAnonymize}
                  />
                </div>
              </div>
            }
          />

          <ExportReportCard
            title="Team list report"
            description="Teams, tracks, leaders, member counts and registration status."
            icon={<GroupsOutlinedIcon fontSize="small" />}
            onExport={handleCreateTeam}
            isExporting={isTeamPending}
            disabled={!activeEventId || isDownloading}
            controls={
              <ScopeSelect
                label="Track"
                allLabel="All tracks"
                value={teamTrackId}
                options={tracks}
                onChange={setTeamTrackId}
              />
            }
          />

          <ExportReportCard
            title="Full event report"
            description="Event setup, teams, rankings, scores, calibration summary and ICC estimate."
            icon={<AssessmentOutlinedIcon fontSize="small" />}
            onExport={handleCreateFullEvent}
            isExporting={isFullEventPending}
            disabled={!activeEventId || isDownloading}
          />

          <ExportReportCard
            title="Calibration report"
            description="Calibration rounds, benchmark coverage, score counts and deviation summary."
            icon={<WorkspacePremiumOutlinedIcon fontSize="small" />}
            onExport={handleCreateCalibration}
            isExporting={isCalibrationPending}
            disabled={!activeEventId || isDownloading}
          />

          {isAdmin && (
            <ExportReportCard
              title="Annual system report"
              description="Cross-event annual or seasonal participation, audit and ICC summaries."
              icon={<AssessmentOutlinedIcon fontSize="small" />}
              onExport={handleCreateAnnual}
              isExporting={isAnnualPending}
              disabled={isDownloading}
              controls={
                <div className="flex flex-wrap gap-3">
                  <TextField
                    size="small"
                    label="Year"
                    type="number"
                    value={annualYear}
                    onChange={(event) => setAnnualYear(event.target.value)}
                    sx={{ width: 130, ...textFieldSx }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Season</InputLabel>
                    <Select
                      label="Season"
                      value={annualSeason}
                      onChange={(event) => setAnnualSeason(event.target.value)}
                      sx={selectSx}
                      MenuProps={menuPropsAll}
                    >
                      <MenuItem value="">All seasons</MenuItem>
                      <MenuItem value="SPRING">Spring</MenuItem>
                      <MenuItem value="SUMMER">Summer</MenuItem>
                      <MenuItem value="FALL">Fall</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              }
            />
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Recent exports
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Download completed workbooks again until their expiration date.
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 tabular-nums dark:bg-slate-800 dark:text-slate-300">
            {totalJobs} jobs
          </span>
        </div>
        <ExportJobTable
          jobs={jobs}
          isLoading={isLoading}
          onDownload={(id) => downloadExport(id as UUID)}
          onRetry={(id) => retryExport(id as UUID)}
          onDelete={(id) => deleteExport(id as UUID)}
          isDownloading={isDownloading}
        />
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, nextPage) => setPage(nextPage - 1)}
              size="small"
              shape="rounded"
              variant="outlined"
              sx={paginationSx}
            />
          </div>
        )}
      </section>
    </div>
  );
};
