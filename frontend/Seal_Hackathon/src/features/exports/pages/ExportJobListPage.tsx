import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Pagination from "@mui/material/Pagination";

import { ExportReportCard } from "../components/ExportReportCard";
import { ExportJobTable } from "../components/ExportJobTable";
import {
  useExportJobsQuery,
  useCreateRankingExport,
  useCreateScoresExport,
  useCreateTeamListExport,
  useCreateGenericExport,
  useDownloadExport,
  useRetryExport,
  useDeleteExport,
} from "../hooks/useExports";
import type { EventExportRequest, ExportFormat } from "@/types/export.types";
import type { UUID } from "@/types/common.types";
import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventsQuery,
  useCoordinatorEventTracksQuery,
  useCoordinatorEventRoundsQuery
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/utils/roleRedirect";

export const ExportJobListPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = getPrimaryRole(user) === "ADMIN";
  const [page, setPage] = useState(0);

  const eventQuery = useCoordinatorEventDetailQuery(eventId as UUID | undefined);
  const eventData = eventQuery.data as any;
  const eventName = eventData?.name ?? eventData?.eventName ?? eventData?.title;

  const { data: eventsData, isLoading: isLoadingEvents } = useCoordinatorEventsQuery({ page: 0, size: 100 });
  const events = eventsData?.content || eventsData || [];
  const eventList = Array.isArray(events) ? events : [];

  const { data: jobsData, isLoading, refetch } = useExportJobsQuery({ page, size: 10 });
  const { mutate: createRanking, isPending: isRankingPending } = useCreateRankingExport();
  const { mutate: createScore, isPending: isScorePending } = useCreateScoresExport();
  const { mutate: createTeam, isPending: isTeamPending } = useCreateTeamListExport();
  const { mutate: createGenericExport, isPending: isGenericPending } = useCreateGenericExport();
  const { mutate: downloadExport, isPending: isDownloading } = useDownloadExport();
  const { mutate: retryExport } = useRetryExport();
  const { mutate: deleteExport } = useDeleteExport();

  const [manualEventId, setManualEventId] = useState<string>("");
  const activeEventId = eventId || manualEventId;

  const tracksQuery = useCoordinatorEventTracksQuery(activeEventId as UUID | undefined);
  const roundsQuery = useCoordinatorEventRoundsQuery(activeEventId as UUID | undefined);
  const tracks = tracksQuery.data || [];
  const rounds = roundsQuery.data || [];

  const [rankingFormat, setRankingFormat] = useState<ExportFormat>("CSV");
  const [rankingDisqualified, setRankingDisqualified] = useState(false);
  const [rankingTrackId, setRankingTrackId] = useState<string>("");
  const [rankingRoundId, setRankingRoundId] = useState<string>("");

  const [scoreFormat, setScoreFormat] = useState<ExportFormat>("CSV");
  const [scoreDrafts, setScoreDrafts] = useState(false);
  const [scoreAnonymize, setScoreAnonymize] = useState(true);
  const [scoreDisqualified, setScoreDisqualified] = useState(false);
  const [scoreTrackId, setScoreTrackId] = useState<string>("");
  const [scoreRoundId, setScoreRoundId] = useState<string>("");

  const [teamFormat, setTeamFormat] = useState<ExportFormat>("CSV");
  const [teamTrackId, setTeamTrackId] = useState<string>("");

  const [fullEventFormat, setFullEventFormat] = useState<ExportFormat>("CSV");
  const [calibrationFormat, setCalibrationFormat] = useState<ExportFormat>("CSV");
  const [annualFormat, setAnnualFormat] = useState<ExportFormat>("CSV");
  const [annualYear, setAnnualYear] = useState<string>(String(new Date().getFullYear()));
  const [annualSeason, setAnnualSeason] = useState<string>("");

  const handleCreateRanking = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: rankingFormat,
      includeDisqualified: rankingDisqualified,
      ...(rankingTrackId && { trackId: rankingTrackId as UUID }),
      ...(rankingRoundId && { roundId: rankingRoundId as UUID }),
    };
    createRanking({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateScore = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: scoreFormat,
      includeDraftScores: scoreDrafts,
      anonymize: scoreAnonymize,
      includeDisqualified: scoreDisqualified,
      ...(scoreTrackId && { trackId: scoreTrackId as UUID }),
      ...(scoreRoundId && { roundId: scoreRoundId as UUID }),
    };
    createScore({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateTeam = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: teamFormat,
      ...(teamTrackId && { trackId: teamTrackId as UUID }),
    };
    createTeam({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateFullEvent = () => {
    if (!activeEventId) return;
    createGenericExport({
      exportType: "FULL_EVENT_REPORT",
      params: {
        eventId: activeEventId as UUID,
        format: fullEventFormat,
      },
    });
  };

  const handleCreateCalibration = () => {
    if (!activeEventId) return;
    createGenericExport({
      exportType: "CALIBRATION_REPORT",
      params: {
        eventId: activeEventId as UUID,
        format: calibrationFormat,
      },
    });
  };

  const handleCreateAnnual = () => {
    const parsedYear = annualYear.trim() ? Number(annualYear) : undefined;
    createGenericExport({
      exportType: "ADMIN_ANNUAL_REPORT",
      params: {
        format: annualFormat,
        ...(Number.isFinite(parsedYear) && { year: parsedYear }),
        ...(annualSeason && { season: annualSeason }),
      },
    });
  };

  const jobs = jobsData?.content || [];
  const totalPages = jobsData?.totalPages || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4">

      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eventId && (
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
              sx={{ mb: 2, textTransform: "none", fontWeight: 800, color: "text.secondary" }}
            >
              Back to Event Edit
            </Button>
          )}
          <h1 className="text-3xl font-black text-slate-950 dark:text-white flex items-center gap-3">
            Export Reports
            {eventName && (
              <>
                <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
                <span className="text-blue-600 dark:text-blue-400 text-xl font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                  {eventName}
                </span>
              </>
            )}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Generate CSV/XLSX reports for rankings, scores/submissions, and team lists.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshOutlinedIcon />}
            onClick={() => refetch()}
            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
          >
            Refresh Jobs
          </Button>
        </div>
      </header>

      {!eventId && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <p className="mb-1 text-sm font-bold text-blue-900 dark:text-blue-100">
            Global Admin Mode
          </p>
          <p className="mb-4 text-xs font-medium text-blue-700 dark:text-blue-300">
            You are viewing export jobs across all events. To create a new export, select an Event below.
          </p>
          <FormControl size="small" sx={{ width: 320, bgcolor: "background.paper", borderRadius: 2 }}>
            <InputLabel>Target Event</InputLabel>
            <Select
              label="Target Event"
              value={manualEventId}
              onChange={(e) => setManualEventId(e.target.value)}
              disabled={isLoadingEvents}
            >
              {isLoadingEvents && (
                <MenuItem value="" disabled>
                  <CircularProgress size={16} sx={{ mr: 2 }} /> Loading events...
                </MenuItem>
              )}
              {!isLoadingEvents && eventList.length === 0 && (
                <MenuItem value="" disabled>No events found</MenuItem>
              )}
              {eventList.map((e: any) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name || e.eventName || e.title || e.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-base font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Create New Export
        </h2>
        <div className="flex flex-col gap-3">

          <ExportReportCard
            title="Ranking Report"
            description="Export final ranking rows with score, rank, advancement & publish state."
            icon={<WorkspacePremiumOutlinedIcon fontSize="small" />}
            iconBgClass="bg-amber-100 dark:bg-amber-900/40"
            iconColorClass="text-amber-600 dark:text-amber-400"
            onExport={handleCreateRanking}
            isExporting={isRankingPending}
            disabled={!activeEventId}
            controls={
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Track</InputLabel>
                    <Select label="Track" value={rankingTrackId} onChange={(e) => setRankingTrackId(e.target.value)}>
                      <MenuItem value="">All Tracks</MenuItem>
                      {tracks.map((t: any) => <MenuItem key={t.id} value={t.id}>{t.name || t.trackName || t.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Round</InputLabel>
                    <Select label="Round" value={rankingRoundId} onChange={(e) => setRankingRoundId(e.target.value)}>
                      <MenuItem value="">All Rounds</MenuItem>
                      {rounds.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name || r.roundName || r.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Format</InputLabel>
                    <Select label="Format" value={rankingFormat} onChange={(e) => setRankingFormat(e.target.value as ExportFormat)}>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="XLSX">Excel</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Switch checked={rankingDisqualified} onChange={(e) => setRankingDisqualified(e.target.checked)} size="small" />}
                    label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Disqualified</span>}
                    sx={{ m: 0 }}
                  />
                </div>
              </div>
            }
          />

          <ExportReportCard
            title="Score Report"
            description="Export score rows per judge, submission and criterion for internal review."
            icon={<AssessmentOutlinedIcon fontSize="small" />}
            iconBgClass="bg-blue-100 dark:bg-blue-900/40"
            iconColorClass="text-blue-600 dark:text-blue-400"
            onExport={handleCreateScore}
            isExporting={isScorePending}
            disabled={!activeEventId}
            controls={
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Track</InputLabel>
                    <Select label="Track" value={scoreTrackId} onChange={(e) => setScoreTrackId(e.target.value)}>
                      <MenuItem value="">All Tracks</MenuItem>
                      {tracks.map((t: any) => <MenuItem key={t.id} value={t.id}>{t.name || t.trackName || t.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Round</InputLabel>
                    <Select label="Round" value={scoreRoundId} onChange={(e) => setScoreRoundId(e.target.value)}>
                      <MenuItem value="">All Rounds</MenuItem>
                      {rounds.map((r: any) => <MenuItem key={r.id} value={r.id}>{r.name || r.roundName || r.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Format</InputLabel>
                    <Select label="Format" value={scoreFormat} onChange={(e) => setScoreFormat(e.target.value as ExportFormat)}>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="XLSX">Excel</MenuItem>
                    </Select>
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormControlLabel
                      control={<Switch checked={scoreDrafts} onChange={(e) => setScoreDrafts(e.target.checked)} size="small" />}
                      label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Draft Scores</span>}
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={scoreDisqualified} onChange={(e) => setScoreDisqualified(e.target.checked)} size="small" />}
                      label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Disqualified</span>}
                      sx={{ m: 0 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={scoreAnonymize} onChange={(e) => setScoreAnonymize(e.target.checked)} size="small" />}
                      label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Anonymize</span>}
                      sx={{ m: 0 }}
                    />
                  </div>
                </div>
              </div>
            }
          />

          <ExportReportCard
            title="Team List Report"
            description="Export teams, tracks, leaders, member counts and registration status."
            icon={<GroupsOutlinedIcon fontSize="small" />}
            iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
            iconColorClass="text-emerald-600 dark:text-emerald-400"
            onExport={handleCreateTeam}
            isExporting={isTeamPending}
            disabled={!activeEventId}
            controls={
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Track</InputLabel>
                    <Select label="Track" value={teamTrackId} onChange={(e) => setTeamTrackId(e.target.value)}>
                      <MenuItem value="">All Tracks</MenuItem>
                      {tracks.map((t: any) => <MenuItem key={t.id} value={t.id}>{t.name || t.trackName || t.id}</MenuItem>)}
                    </Select>
                  </FormControl>
                </div>
                <div className="flex items-center gap-4">
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Format</InputLabel>
                    <Select label="Format" value={teamFormat} onChange={(e) => setTeamFormat(e.target.value as ExportFormat)}>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="XLSX">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            }
          />

          <ExportReportCard
            title="Full Event Report"
            description="Export event setup, teams, rankings, scores, calibration summary and ICC estimate."
            icon={<AssessmentOutlinedIcon fontSize="small" />}
            iconBgClass="bg-purple-100 dark:bg-purple-900/40"
            iconColorClass="text-purple-600 dark:text-purple-400"
            onExport={handleCreateFullEvent}
            isExporting={isGenericPending}
            disabled={!activeEventId}
            exportText="Export event"
            controls={
              <div className="flex items-center gap-4">
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Format</InputLabel>
                  <Select label="Format" value={fullEventFormat} onChange={(e) => setFullEventFormat(e.target.value as ExportFormat)}>
                    <MenuItem value="CSV">CSV</MenuItem>
                    <MenuItem value="XLSX">Excel</MenuItem>
                  </Select>
                </FormControl>
              </div>
            }
          />

          <ExportReportCard
            title="Calibration Report"
            description="Export calibration rounds, benchmark coverage, score counts and benchmark deviation summary."
            icon={<WorkspacePremiumOutlinedIcon fontSize="small" />}
            iconBgClass="bg-cyan-100 dark:bg-cyan-900/40"
            iconColorClass="text-cyan-600 dark:text-cyan-400"
            onExport={handleCreateCalibration}
            isExporting={isGenericPending}
            disabled={!activeEventId}
            exportText="Export calibration"
            controls={
              <div className="flex items-center gap-4">
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Format</InputLabel>
                  <Select label="Format" value={calibrationFormat} onChange={(e) => setCalibrationFormat(e.target.value as ExportFormat)}>
                    <MenuItem value="CSV">CSV</MenuItem>
                    <MenuItem value="XLSX">Excel</MenuItem>
                  </Select>
                </FormControl>
              </div>
            }
          />

          {isAdmin && (
            <ExportReportCard
              title="Admin Annual/System Report"
              description="Generate cross-event annual or seasonal participation, audit and ICC summary reports."
              icon={<AssessmentOutlinedIcon fontSize="small" />}
              iconBgClass="bg-rose-100 dark:bg-rose-900/40"
              iconColorClass="text-rose-600 dark:text-rose-400"
              onExport={handleCreateAnnual}
              isExporting={isGenericPending}
              exportText="Export system"
              controls={
                <div className="flex flex-wrap items-center gap-4">
                  <TextField
                    size="small"
                    label="Year"
                    type="number"
                    value={annualYear}
                    onChange={(e) => setAnnualYear(e.target.value)}
                    sx={{ width: 120 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Season</InputLabel>
                    <Select label="Season" value={annualSeason} onChange={(e) => setAnnualSeason(e.target.value)}>
                      <MenuItem value="">All Seasons</MenuItem>
                      <MenuItem value="SPRING">Spring</MenuItem>
                      <MenuItem value="SUMMER">Summer</MenuItem>
                      <MenuItem value="FALL">Fall</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Format</InputLabel>
                    <Select label="Format" value={annualFormat} onChange={(e) => setAnnualFormat(e.target.value as ExportFormat)}>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="XLSX">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              }
            />
          )}

        </div>

      </section>

      <section>
        <h2 className="mb-4 text-base font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Recent Export Jobs
        </h2>
        <ExportJobTable
          jobs={jobs}
          isLoading={isLoading}
          onDownload={(id) => downloadExport(id as UUID)}
          onRetry={(id) => retryExport(id as UUID)}
          onDelete={(id) => deleteExport(id as UUID)}
          isDownloading={isDownloading}
        />
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, p) => setPage(p - 1)}
              size="small"
              shape="rounded"
              variant="outlined"
              color="primary"
            />
          </div>
        )}
      </section>

    </div>
  );
};
