import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
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
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: jobsData, isLoading } = useExportJobsQuery({ page, size: 10 });
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
    const payload: EventExportRequest = {
      format: rankingFormat,
      includeDisqualified: rankingDisqualified,
    };
    createRanking({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateScore = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: scoreFormat,
      includeDraftScores: scoreDrafts,
      anonymize: scoreAnonymize,
    };
    createScore({ eventId: activeEventId as UUID, payload });
  };

  const handleCreateTeam = () => {
    if (!activeEventId) return;
    const payload: EventExportRequest = {
      format: teamFormat,
    };
    createTeam({ eventId: activeEventId as UUID, payload });
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, textTransform: "none", color: "text.secondary" }}
        >
          Back
        </Button>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Export Reports
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Generate CSV/XLSX reports for rankings, scores/submissions, and team lists.
        </p>
      </div>

      {!eventId && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
          <h2 className="mb-2 text-sm font-bold text-blue-900 dark:text-blue-100">Global Admin Mode</h2>
          <p className="mb-4 text-xs text-blue-700 dark:text-blue-300">
            You are viewing all export jobs across the system. To create a new export, you must provide an Event ID.
          </p>
          <TextField
            size="small"
            label="Target Event ID"
            value={manualEventId}
            onChange={(e) => setManualEventId(e.target.value)}
            sx={{ width: 300, bgcolor: "background.paper" }}
          />
        </div>
      )}

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <ExportReportCard
          title="Ranking Report"
          description="Export final or preview ranking rows with score, rank, advancement status and publish state."
          icon={<WorkspacePremiumOutlinedIcon fontSize="medium" />}
          iconBgColor="bg-amber-100 dark:bg-amber-900/40"
          iconColor="text-amber-600 dark:text-amber-400"
          onExport={handleCreateRanking}
          isExporting={isRankingPending}
          disabled={!activeEventId}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={rankingFormat}
              label="Format"
              onChange={(e) => setRankingFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="XLSX">Excel (XLSX)</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={rankingDisqualified}
                onChange={(e) => setRankingDisqualified(e.target.checked)}
              />
            }
            label={<span className="text-sm text-slate-600 dark:text-slate-300">Include Disqualified</span>}
          />
        </ExportReportCard>

        <ExportReportCard
          title="Score Report"
          description="Export score rows per judge, submission and criterion for internal review and calibration."
          icon={<AssessmentOutlinedIcon fontSize="medium" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/40"
          iconColor="text-blue-600 dark:text-blue-400"
          onExport={handleCreateScore}
          isExporting={isScorePending}
          disabled={!activeEventId}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={scoreFormat}
              label="Format"
              onChange={(e) => setScoreFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="XLSX">Excel (XLSX)</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={scoreDrafts} onChange={(e) => setScoreDrafts(e.target.checked)} />}
            label={<span className="text-sm text-slate-600 dark:text-slate-300">Include Drafts</span>}
          />
          <FormControlLabel
            control={<Switch checked={scoreAnonymize} onChange={(e) => setScoreAnonymize(e.target.checked)} />}
            label={<span className="text-sm text-slate-600 dark:text-slate-300">Anonymize Judges</span>}
          />
        </ExportReportCard>

        <ExportReportCard
          title="Team List Report"
          description="Export teams, tracks, leaders, member counts and registration status."
          icon={<GroupsOutlinedIcon fontSize="medium" />}
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onExport={handleCreateTeam}
          isExporting={isTeamPending}
          disabled={!activeEventId}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={teamFormat}
              label="Format"
              onChange={(e) => setTeamFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="CSV">CSV</MenuItem>
              <MenuItem value="XLSX">Excel (XLSX)</MenuItem>
            </Select>
          </FormControl>
        </ExportReportCard>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Recent Export Jobs</h2>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-500">Loading jobs...</span>
          </div>
        ) : (
          <>
            <ExportJobTable
              jobs={jobsData?.data?.content || []}
              onDownload={(id) => downloadExport(id as UUID)}
              onRetry={(id) => retryExport(id as UUID)}
              onDelete={(id) => deleteExport(id as UUID)}
              isDownloading={isDownloading}
            />
            {jobsData?.data?.totalPages && jobsData.data.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  count={jobsData.data.totalPages}
                  page={page + 1}
                  onChange={(_, p) => setPage(p - 1)}
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
