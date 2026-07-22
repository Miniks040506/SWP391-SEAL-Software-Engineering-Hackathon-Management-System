import { useParams, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Chip from "@mui/material/Chip";

import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import { useJudgeSubmissionDetailQuery } from "../hooks/useJudge";

export const JudgeSubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
  } = useJudgeSubmissionDetailQuery(submissionId);
  const detail = response;

  if (isLoading)
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  if (isError || !detail)
    return (
      <div className="p-6 text-center text-red-500 font-bold">
        Submission not found.
      </div>
    );

  const criteria = detail.criteria || [];

  return (
    <div className="space-y-8 p-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-blue-500"
      >
        <ArrowBackOutlinedIcon fontSize="small" /> Back to Queue
      </button>

      <Card
        variant="outlined"
        className="rounded-2xl dark:border-slate-700 dark:bg-slate-800"
      >
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <Chip
                label="Assigned submission"
                size="small"
                className="mb-3 font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30"
              />
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {detail.projectTitle || detail.teamName}
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-slate-400">
                Team: {detail.teamName}
              </p>
            </div>
            <Chip
              label="View only"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </div>

          <div className="mt-8">
            <dl className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3 dark:bg-slate-900/50">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Event
                </dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {detail.eventName || "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Round
                </dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {detail.roundName || "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Track
                </dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">
                  {detail.trackName || "Not available"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Submission note
            </h3>
            <div className="rounded-xl bg-slate-50 p-5 text-gray-700 dark:bg-slate-900/50 dark:text-slate-300">
              {detail.note || "No note provided."}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Submitted Links/Files
            </h3>
            {detail.links && detail.links.length > 0 ? (
              <SubmissionLinksPreview links={detail.links} />
            ) : (
              <p className="text-sm text-gray-500">No files attached.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {criteria.length > 0 ? (
        <Card
          variant="outlined"
          className="rounded-2xl border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-slate-800/80"
        >
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 dark:text-blue-400">
                Scoring Ready
              </h2>
              <p className="mt-1 text-sm font-medium text-blue-600/80 dark:text-blue-300/80">
                This submission is ready for grading. Click below to open the
                interactive score sheet.
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/judge/submissions/${detail.submissionId}/score`)
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-extrabold text-white shadow-sm hover:bg-blue-700"
            >
              Open Score Sheet
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-300 bg-rose-50 p-8 text-center text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/10">
          <p className="font-bold">
            No scoring criteria configured for this round.
          </p>
          <p className="text-sm mt-1">Please contact the Event Coordinator.</p>
        </div>
      )}
    </div>
  );
};
