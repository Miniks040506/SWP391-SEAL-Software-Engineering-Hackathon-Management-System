import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { DisqualificationAppealForm } from "../components/DisqualificationAppealForm";
import { DisqualificationStatusBadge } from "../components/DisqualificationStatusBadge";
import { useActiveTeamDisqualificationsQuery } from "../hooks/useDisqualificationQueries";
import type { UUID } from "@/types/common.types";

type AppealStatus = "PENDING" | "UPHELD" | "OVERTURNED";

function formatIssuedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AppealResult({
  status,
  note,
}: {
  status: AppealStatus;
  note?: string;
}) {
  if (status === "PENDING") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <ScheduleRoundedIcon className="mt-0.5 text-amber-700 dark:text-amber-300" />
          <div>
            <h3 className="font-bold text-amber-950 dark:text-amber-100">
              Appeal under review
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-900/75 dark:text-amber-200/75">
              Event coordinators are reviewing your submission. No further
              action is needed right now.
            </p>
          </div>
        </div>
        {note && (
          <div className="mt-4 rounded-xl bg-white/70 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-950/30 dark:text-slate-300">
            <span className="mb-1 block font-semibold text-slate-900 dark:text-white">
              Your appeal
            </span>
            {note}
          </div>
        )}
      </div>
    );
  }

  if (status === "OVERTURNED") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <CheckCircleOutlineRoundedIcon className="mt-0.5 text-emerald-700 dark:text-emerald-300" />
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-100">
              Decision overturned
            </h3>
            <p className="mt-1 text-sm leading-6 text-emerald-900/75 dark:text-emerald-200/75">
              The disqualification was removed and your submission status was
              restored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/20">
      <div className="flex items-start gap-3">
        <GavelRoundedIcon className="mt-0.5 text-rose-700 dark:text-rose-300" />
        <div>
          <h3 className="font-bold text-rose-950 dark:text-rose-100">
            Decision upheld
          </h3>
          <p className="mt-1 text-sm leading-6 text-rose-900/75 dark:text-rose-200/75">
            The review is complete and the disqualification remains in effect.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ParticipantDisqualificationPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [appealDialogOpen, setAppealDialogOpen] = useState(false);

  const {
    data: disqualifications = [],
    isLoading,
    isError,
    refetch,
  } = useActiveTeamDisqualificationsQuery(teamId as UUID | undefined);

  const disqualification = disqualifications[0];

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-5xl animate-pulse space-y-6"
        aria-label="Loading disqualification status"
      >
        <div className="h-16 w-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-56 rounded-[28px] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-80 rounded-[28px] bg-slate-200 dark:bg-slate-800 lg:col-span-8" />
          <div className="h-80 rounded-[28px] bg-slate-200 dark:bg-slate-800 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!teamId || isError) {
    return (
      <div className="mx-auto max-w-3xl rounded-[28px] border border-rose-200 bg-rose-50 p-7 dark:border-rose-900/60 dark:bg-rose-950/20">
        <Alert severity="error" sx={{ background: "transparent", p: 0 }}>
          Could not load this team's disqualification status.
        </Alert>
      </div>
    );
  }

  const teamPath = `/participant/teams/${teamId}`;
  const appealStatus = disqualification?.appealStatus as
    | AppealStatus
    | undefined;

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-8 animate-in fade-in duration-500">
      <header className="flex items-start gap-4">
        <IconButton
          onClick={() => navigate(teamPath)}
          aria-label="Back to team"
          sx={{
            mt: 0.25,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            transition: "transform 180ms ease, background-color 180ms ease",
            "&:hover": {
              backgroundColor: "action.hover",
              transform: "translateX(-2px)",
            },
            "&:active": { transform: "translateX(-1px) scale(0.97)" },
          }}
        >
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl">
            Disqualification review
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
            Review the decision, supporting information, and your appeal status.
          </p>
        </div>
      </header>

      {!disqualification ? (
        <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-7 py-12 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20 sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 30 }} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-100">
            No active disqualification
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-900/70 dark:text-emerald-200/70">
            This team currently has no active disqualification record.
          </p>
          <Button
            variant="outlined"
            onClick={() => navigate(teamPath)}
            sx={{ mt: 3, borderRadius: "11px", px: 3, fontWeight: 700 }}
          >
            Return to team
          </Button>
        </section>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[28px] border border-rose-300 bg-rose-100 dark:border-rose-800/60 dark:bg-rose-900/20 dark:shadow-black/20">
            <div className="absolute right-0 top-0 size-48 translate-x-12 -translate-y-16 rounded-full bg-rose-200/35 blur-3xl dark:bg-rose-900/15" />
            <div className="relative grid gap-7 px-6 py-7 sm:px-8 sm:py-8 md:grid-cols-[1fr_auto] md:items-start">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                  <WarningAmberRoundedIcon sx={{ fontSize: 27 }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Submission decision
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-rose-950 dark:text-rose-100 sm:text-3xl">
                    Submission disqualified
                  </h2>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-rose-900/65 dark:text-rose-200/65">
                    <ScheduleRoundedIcon sx={{ fontSize: 17 }} />
                    Issued {formatIssuedAt(disqualification.issuedAt)}
                  </p>
                </div>
              </div>
              <DisqualificationStatusBadge appealStatus={appealStatus} />
            </div>

            <dl className="relative grid border-t border-rose-200/80 bg-white/45 sm:grid-cols-3 dark:border-rose-900/50 dark:bg-slate-950/15">
              <div className="px-6 py-5 sm:px-8">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Team
                </dt>
                <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                  {disqualification.teamName}
                </dd>
              </div>
              <div className="border-t border-rose-200/70 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8 dark:border-rose-900/40">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Event and round
                </dt>
                <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                  {disqualification.eventName}{" "}
                  <span className="font-medium text-slate-500">
                    / {disqualification.roundName}
                  </span>
                </dd>
              </div>
              <div className="border-t border-rose-200/70 px-6 py-5 sm:border-l sm:border-t-0 sm:px-8 dark:border-rose-900/40">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Submission status
                </dt>
                <dd className="mt-1 font-bold text-slate-900 dark:text-white">
                  {disqualification.submissionStatus}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 lg:grid-cols-12">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 sm:p-8 lg:col-span-8">
              <div className="flex items-center gap-3">
                <AssignmentOutlinedIcon className="text-rose-600 dark:text-rose-300" />
                <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Decision details
                </h2>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Reason provided
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-300">
                  {disqualification.reason}
                </p>
              </div>

              {disqualification.evidenceUrl && (
                <div className="mt-7 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950/50">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Supporting evidence
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    This link was attached by the coordinator who issued the
                    decision.
                  </p>
                  <a
                    href={disqualification.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    Open evidence
                    <OpenInNewRoundedIcon sx={{ fontSize: 17 }} />
                  </a>
                </div>
              )}

              <dl className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
                <div>
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Team status
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {disqualification.teamStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Issued by
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {disqualification.issuedByName || "Event coordinator"}
                  </dd>
                </div>
              </dl>
            </article>

            <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 sm:p-7 lg:col-span-4">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Appeal
              </h2>
              {!appealStatus ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    If information was missed or interpreted incorrectly, your
                    team may submit one appeal.
                  </p>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/50">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Before submitting
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Explain what should be reviewed and include only
                      information relevant to this decision.
                    </p>
                  </div>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setAppealDialogOpen(true)}
                    sx={{
                      mt: 3,
                      minHeight: 46,
                      borderRadius: "11px",
                      fontWeight: 800,
                      boxShadow: "none",
                      "&:active": { transform: "scale(0.98)" },
                    }}
                  >
                    Start appeal
                  </Button>
                </>
              ) : (
                <div className="mt-5">
                  <AppealResult
                    status={appealStatus}
                    note={disqualification.appealNote}
                  />
                </div>
              )}
            </aside>
          </div>

          <Dialog
            open={appealDialogOpen}
            onClose={() => setAppealDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            aria-labelledby="appeal-dialog-title"
            sx={{
              "& .MuiBackdrop-root": {
                backgroundColor: "rgba(15, 23, 42, 0.62)",
                backdropFilter: "blur(4px)",
              },
              "& .MuiDialog-paper": {
                overflow: "hidden",
                borderRadius: "24px",
                border: "1px solid",
                borderColor: "divider",
                backgroundImage: "none",
                boxShadow: "0 28px 90px rgba(15, 23, 42, 0.28)",
              },
            }}
          >
            <DialogTitle id="appeal-dialog-title" sx={{ p: 0 }}>
              <div className="flex items-start justify-between gap-5 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    <AssignmentOutlinedIcon />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                      Submit an appeal
                    </h2>
                    <p className="mt-1 text-sm font-normal leading-5 text-slate-500 dark:text-slate-400">
                      Ask the coordinator to review this decision.
                    </p>
                  </div>
                </div>
                <IconButton
                  onClick={() => setAppealDialogOpen(false)}
                  aria-label="Close appeal dialog"
                  size="small"
                  sx={{
                    borderRadius: "10px",
                    "&:active": { transform: "scale(0.96)" },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 3, sm: 3.5 } }}>
              <DisqualificationAppealForm
                disqualificationId={disqualification.id}
                onCancel={() => setAppealDialogOpen(false)}
                onSuccess={() => {
                  setAppealDialogOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </main>
  );
}
