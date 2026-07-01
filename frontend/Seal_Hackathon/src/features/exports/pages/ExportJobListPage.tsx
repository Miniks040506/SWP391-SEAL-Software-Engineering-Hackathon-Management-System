import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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
  useDownloadExport,
  useRetryExport,
  useDeleteExport,
} from "../hooks/useExports";
import type { EventExportRequest, ExportFormat } from "@/types/export.types";
import type { UUID } from "@/types/common.types";

export const ExportJobListPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [page, setPage] = useState(0);

  const { data: jobsData, isLoading, refetch } = useExportJobsQuery({ page, size: 10 });
  const { mutate: createRanking, isPending: isRankingPending } = useCreateRankingExport();
  const { mutate: createScore, isPending: isScorePending } = useCreateScoresExport();
  const { mutate: createTeam, isPending: isTeamPending } = useCreateTeamListExport();
  const { mutate: downloadExport, isPending: isDownloading } = useDownloadExport();
  const { mutate: retryExport } = useRetryExport();
  const { mutate: deleteExport } = useDeleteExport();

  const [rankingFormat, setRankingFormat] = useState<ExportFormat>("CSV");
  const [rankingDisqualified, setRankingDisqualified] = useState(false);

  const [scoreFormat, setScoreFormat] = useState<ExportFormat>("CSV");
  const [scoreDrafts, setScoreDrafts] = useState(false);
  const [scoreAnonymize, setScoreAnonymize] = useState(true);

  const [teamFormat, setTeamFormat] = useState<ExportFormat>("CSV");

  const [manualEventId, setManualEventId] = useState<string>("");
  const activeEventId = eventId || manualEventId;

  const handleCreateRanking = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = { format: rankingFormat, includeDisqualified: rankingDisqualified };
    createRanking({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateScore = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = { format: scoreFormat, includeDraftScores: scoreDrafts, anonymize: scoreAnonymize };
    createScore({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateTeam = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = { format: teamFormat };
    createTeam({ eventId: activeEventId as UUID, payload });
  };

  const jobs = jobsData?.data?.content || [];
  const totalPages = jobsData?.data?.totalPages || 0;

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
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Export Reports
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
            You are viewing export jobs across all events. To create a new export, enter an Event ID below.
          </p>
          <TextField
            size="small"
            label="Target Event ID"
            value={manualEventId}
            onChange={(e) => setManualEventId(e.target.value)}
            sx={{ width: 320, bgcolor: "background.paper", borderRadius: 2 }}
          />
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
              <>
                <ToggleButtonGroup
                  value={rankingFormat}
                  exclusive
                  size="small"
                  onChange={(_, v) => v && setRankingFormat(v)}
                  sx={{ height: 34 }}
                >
                  <ToggleButton value="CSV" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>CSV</ToggleButton>
                  <ToggleButton value="XLSX" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Excel</ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={rankingDisqualified}
                      onChange={(e) => setRankingDisqualified(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Include Disqualified</span>}
                />
              </>
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
              <>
                <ToggleButtonGroup
                  value={scoreFormat}
                  exclusive
                  size="small"
                  onChange={(_, v) => v && setScoreFormat(v)}
                  sx={{ height: 34 }}
                >
                  <ToggleButton value="CSV" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>CSV</ToggleButton>
                  <ToggleButton value="XLSX" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Excel</ToggleButton>
                </ToggleButtonGroup>
                <div className="flex flex-col gap-1">
                  <FormControlLabel
                    control={<Switch checked={scoreDrafts} onChange={(e) => setScoreDrafts(e.target.checked)} size="small" />}
                    label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Include Draft Scores</span>}
                  />
                  <FormControlLabel
                    control={<Switch checked={scoreAnonymize} onChange={(e) => setScoreAnonymize(e.target.checked)} size="small" />}
                    label={<span className="text-sm font-medium text-slate-600 dark:text-slate-300">Anonymize Judges</span>}
                  />
                </div>
              </>
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
              <ToggleButtonGroup
                value={teamFormat}
                exclusive
                size="small"
                onChange={(_, v) => v && setTeamFormat(v)}
                sx={{ height: 34 }}
              >
                <ToggleButton value="CSV" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>CSV</ToggleButton>
                <ToggleButton value="XLSX" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Excel</ToggleButton>
              </ToggleButtonGroup>
            }
          />

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
