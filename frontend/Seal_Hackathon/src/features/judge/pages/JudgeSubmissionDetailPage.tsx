import "../styles/judge.css";

import type { CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import { JudgePageHero } from "../components/common/JudgePageHero";
import { useJudgeSubmissionDetailQuery } from "../hooks/useJudge";

export const JudgeSubmissionDetailPage = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const { data: detail, isLoading, isError } =
    useJudgeSubmissionDetailQuery(submissionId);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="jd-shimmer h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="jd-shimmer h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="jd-settle mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center dark:border-rose-900/50 dark:bg-rose-900/10">
        <ReportProblemOutlinedIcon className="text-rose-400" sx={{ fontSize: 40 }} />
        <p className="mt-2 font-black text-rose-700 dark:text-rose-300">Submission not found</p>
        <button
          type="button"
          onClick={() => navigate("/judge/submissions")}
          className="jd-press mt-4 cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
        >
          Back to queue
        </button>
      </div>
    );
  }

  const criteria = detail.criteria || [];

  return (
    <div className="space-y-5">
      <JudgePageHero
        eyebrow="Assigned submission"
        title={detail.projectTitle || detail.teamName}
        subtitle={`Team ${detail.teamName}`}
        backTo={{ label: "Back to Queue", onClick: () => navigate(-1) }}
        chips={
          <>
            {[detail.eventName, detail.roundName, detail.trackName]
              .filter((c): c is string => Boolean(c))
              .map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {chip}
                </span>
              ))}
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <VisibilityOutlinedIcon sx={{ fontSize: 13 }} /> Read-only preview
            </span>
          </>
        }
      />

      <section
        className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-900"
        style={{ "--jd-stagger": 1 } as CSSProperties}
      >
        <h2 className="flex items-center gap-2 text-base font-black text-slate-950 dark:text-white">
          <DescriptionOutlinedIcon sx={{ fontSize: 18 }} className="text-slate-400" />
          Submission note
        </h2>
        <div className="mt-3 rounded-xl bg-slate-50 p-5 text-sm font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          {detail.note || "No note provided."}
        </div>
      </section>

      <section
        className="jd-fade-up rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700/80 dark:bg-slate-900"
        style={{ "--jd-stagger": 2 } as CSSProperties}
      >
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Submitted Links &amp; Files
        </h2>
        <div className="mt-3">
          {detail.links && detail.links.length > 0 ? (
            <SubmissionLinksPreview links={detail.links} />
          ) : (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No files attached.
            </p>
          )}
        </div>
      </section>

      {criteria.length > 0 ? (
        <section
          className="jd-fade-up jd-settle flex flex-col items-start justify-between gap-5 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-violet-50/40 p-6 sm:flex-row sm:items-center dark:border-blue-500/30 dark:from-blue-500/10 dark:to-violet-500/5"
          style={{ "--jd-stagger": 3 } as CSSProperties}
        >
          <div>
            <h2 className="text-lg font-black text-blue-900 dark:text-blue-300">Ready to score</h2>
            <p className="mt-1 text-sm font-medium text-blue-700/80 dark:text-blue-300/70">
              {criteria.length} evaluation criteria configured. Open the interactive score sheet
              to grade this submission.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/judge/submissions/${detail.submissionId}/score`)}
            className="jd-press inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-extrabold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Open Score Sheet
            <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </section>
      ) : (
        <div
          className="jd-fade-up jd-settle rounded-2xl border border-dashed border-rose-300 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-900/10"
          style={{ "--jd-stagger": 3 } as CSSProperties}
        >
          <ReportProblemOutlinedIcon className="text-rose-400" sx={{ fontSize: 32 }} />
          <p className="mt-2 font-bold text-rose-600 dark:text-rose-300">
            No scoring criteria configured for this round
          </p>
          <p className="mt-1 text-sm text-rose-500/80 dark:text-rose-300/70">
            Please contact the Event Coordinator.
          </p>
        </div>
      )}
    </div>
  );
};
