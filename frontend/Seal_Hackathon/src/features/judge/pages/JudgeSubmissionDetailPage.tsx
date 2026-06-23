import { useParams, useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import Chip from "@mui/material/Chip";

import { useJudgeSubmissionDetailQuery } from "../hooks/useJudge";
import { JudgeGradingPanel } from "../components/submission/JudgeGradingPanel";

export const JudgeSubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const isLocked = (state as { roundSubmissionLocked?: boolean })?.roundSubmissionLocked ?? false;
  
  const { data: response, isLoading, isError } = useJudgeSubmissionDetailQuery(submissionId);
  const detail = response;

  if (isLoading) return <div className="flex justify-center py-24"><CircularProgress /></div>;
  if (isError || !detail) return <div className="p-6 text-center text-red-500 font-bold">Submission not found.</div>;

  const criteria = detail.criteria || [];

  return (
    <div className="space-y-8 p-6 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-blue-500"
      >
        <ArrowBackOutlinedIcon fontSize="small" /> Back to Queue
      </button>

      <Card variant="outlined" className="rounded-2xl dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <Chip label="Assigned submission" size="small" className="mb-3 font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30" />
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {detail.projectTitle || detail.teamName}
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-slate-400">Team: {detail.teamName}</p>
            </div>
            <Chip label="View only" color="info" variant="outlined" sx={{ fontWeight: 800 }} />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Submission note</h3>
            <div className="rounded-xl bg-slate-50 p-5 text-gray-700 dark:bg-slate-900/50 dark:text-slate-300">
              {detail.note || "No note provided."}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Submitted Links/Files</h3>
            {detail.links && detail.links.length > 0 ? (
              <div className="flex gap-4 flex-wrap">
                {detail.links.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                    <AttachFileOutlinedIcon fontSize="small" className="text-gray-400" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{link.label || link.linkType}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No files attached.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {criteria.length > 0 ? (
        <JudgeGradingPanel
          submissionId={detail.submissionId}
          criteria={criteria.map(c => ({
            id: c.id,
            name: c.effectiveName || "",
            description: c.effectiveDescription || "",
            maxScore: c.effectiveMaxScore || 0
          }))}
          gradingStatus={(detail as any).gradingStatus || "PENDING"}
          scoredData={(detail as any).scoredData}
          isLocked={isLocked}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-300 bg-rose-50 p-8 text-center text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/10">
          <p className="font-bold">No scoring criteria configured for this round.</p>
          <p className="text-sm mt-1">Please contact the Event Coordinator.</p>
        </div>
      )}
    </div>
  );
};
