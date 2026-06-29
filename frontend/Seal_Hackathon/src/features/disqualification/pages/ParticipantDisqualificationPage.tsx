import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  useEventDisqualificationsQuery,
} from "../hooks/useDisqualificationQueries";
import { DisqualificationStatusBadge } from "../components/DisqualificationStatusBadge";
import { DisqualificationAppealForm } from "../components/DisqualificationAppealForm";
import { teamApi } from "@/api/team.api";
import type { DisqualificationResponse } from "@/types/disqualification.types";
import type { EventCompetitionSummaryResponse } from "@/types/team.types";
import type { UUID } from "@/types/common.types";



export function ParticipantDisqualificationPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [teamComp, setTeamComp] = useState<EventCompetitionSummaryResponse | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    setLoadingTeam(true);
    teamApi
      .getMyActiveCompetitions()
      .then((res) => {
        setTeamComp(res.find((t) => t.teamId === teamId) || null);
      })
      .catch((err) => {
        console.error("Failed to fetch team competition", err);
      })
      .finally(() => {
        setLoadingTeam(false);
      });
  }, [teamId]);

  const eventId = teamComp?.eventId as UUID;

  const {
    data: disqualifications = [],
    isLoading: loadingDisqualifications,
    refetch,
  } = useEventDisqualificationsQuery(eventId, undefined);

  const disqualification = disqualifications.find(
    (d: DisqualificationResponse) => d.teamId === teamId,
  );

  if (loadingTeam || (eventId && loadingDisqualifications)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!teamComp) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert severity="error">Team or active competition not found.</Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Disqualification & Appeal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View your team's disqualification status and manage your appeal if
          applicable.
        </p>
      </div>

      {!disqualification ? (
        <Card className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-8 text-center text-slate-600 dark:text-slate-400">
            No active disqualification for this team.
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-slate-800">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <Typography
                  variant="h6"
                  className="font-bold text-slate-900 dark:text-slate-100 mb-1"
                >
                  Submission Disqualified
                </Typography>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Issued at {new Date(disqualification.issuedAt).toLocaleString()}
                </div>
              </div>
              <DisqualificationStatusBadge
                appealStatus={disqualification.appealStatus as "PENDING" | "UPHELD" | "OVERTURNED" | undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Submission Status
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {disqualification.submissionStatus}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Team Status
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {disqualification.teamStatus}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Reason for Disqualification
              </span>
              <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {disqualification.reason}
              </p>
              {disqualification.evidenceUrl && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={disqualification.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Evidence
                  </a>
                </div>
              )}
            </div>

            {/* Appeal Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              {!disqualification.appealStatus ? (
                <DisqualificationAppealForm 
                  disqualificationId={disqualification.id}
                  onSuccess={() => refetch()}
                />
              ) : (
                <div className="space-y-3">
                  <Typography
                    variant="subtitle2"
                    className="font-bold text-slate-800 dark:text-slate-200"
                  >
                    Appeal Status
                  </Typography>
                  {disqualification.appealStatus === "PENDING" && (
                    <Alert severity="warning">
                      Appeal submitted. Your appeal is currently under review by
                      the event coordinators.
                      {disqualification.appealNote && (
                        <div className="mt-2 text-sm italic">
                          " {disqualification.appealNote} "
                        </div>
                      )}
                    </Alert>
                  )}
                  {disqualification.appealStatus === "UPHELD" && (
                    <Alert severity="error">
                      Your appeal was upheld. The disqualification stands.
                    </Alert>
                  )}
                  {disqualification.appealStatus === "OVERTURNED" && (
                    <Alert severity="success">
                      Your disqualification has been overturned. Your submission
                      status has been restored.
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
