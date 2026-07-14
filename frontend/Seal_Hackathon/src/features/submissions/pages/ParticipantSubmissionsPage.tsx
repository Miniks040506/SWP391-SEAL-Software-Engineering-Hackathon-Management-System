import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { teamApi } from "@/api/team.api";
import { useTeamSubmissionsQuery } from "../hooks/useParticipantSubmissionQueries";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";

export function ParticipantSubmissionsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { submissions, loading } = useTeamSubmissionsQuery(teamId);

  const activeCompetitionsQuery = useQuery({
    queryKey: ["my-active-competitions"],
    queryFn: () => teamApi.getMyActiveCompetitions(),
  });

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    const competitions = activeCompetitionsQuery.data ?? [];
    const activeCompetition = competitions.find((c) => c.teamId === teamId);

    if (activeCompetition) {
      navigate(`/participant/events/${activeCompetition.eventId}/competing`, { state: { fromInternal: true } });
    } else {
      navigate(`/participant/teams/${teamId}`);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
        >
          <ArrowBackOutlinedIcon style={{ fontSize: 16 }} />
          Back
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            My Submissions
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            View and manage your team's deliverables across all rounds.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading submissions...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                No submissions yet.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Submit your deliverables when your round is open.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {sub.roundName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>#{sub.submissionNumber}</span>
                      <span>
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleString()
                          : "Not submitted"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <SubmissionStatusBadge status={sub.status} size="sm" />
                    <button
                      onClick={() =>
                        navigate(
                          `/participant/teams/${teamId}/rounds/${sub.roundId}/submission`,
                        )
                      }
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 px-3 py-1.5 rounded-lg transition-all font-medium"
                    >
                      {sub.status === "DRAFT" ? "Continue →" : "View →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
