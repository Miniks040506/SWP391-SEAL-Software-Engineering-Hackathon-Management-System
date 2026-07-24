import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { useSubmissionAdminDetailQuery } from "../hooks/useCoordinatorSubmissionQueries";
import { SubmissionLinksPreview } from "../components/SubmissionLinksPreview";
import { getSubmissionStatusColor } from "../schemas/submissions.schema";
import { DisqualifySubmissionDialog } from "@/features/disqualification/components/DisqualifySubmissionDialog";
import { OverturnDisqualificationDialog } from "@/features/disqualification/components/OverturnDisqualificationDialog";
import { DisqualificationStatusBadge } from "@/features/disqualification/components/DisqualificationStatusBadge";
import {
  useDisqualifySubmissionMutation,
  useOverturnDisqualificationMutation,
} from "@/features/disqualification/hooks/useDisqualificationQueries";
import type { DisqualifyFormValues } from "@/features/disqualification/schemas/disqualification.schema";
import type { OverturnFormValues } from "@/features/disqualification/schemas/disqualification.schema";
import "../styles/submissionDetail.css";

/** Accent colour for the hero status ribbon. */
function statusRibbon(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-emerald-500";
    case "LATE":
      return "bg-amber-500";
    case "DISQUALIFIED":
      return "bg-red-500";
    case "DRAFT":
      return "bg-blue-500";
    default:
      return "bg-slate-400";
  }
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-slate-400 dark:text-slate-500">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </div>
        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}

export function CoordinatorSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const dqId = searchParams.get("dq");
  const navigate = useNavigate();

  const { detail, loading, error, refetch } =
    useSubmissionAdminDetailQuery(submissionId);

  const disqualifyMutation = useDisqualifySubmissionMutation();
  const overturnMutation = useOverturnDisqualificationMutation();
  const [disqualifyOpen, setDisqualifyOpen] = useState(false);
  const [overturnOpen, setOverturnOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowBackOutlinedIcon fontSize="small" /> Back
        </button>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            Submission not found
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            This submission could not be loaded. It may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const status = detail.status;
  const isScorable = status === "SUBMITTED" || status === "LATE";
  const isDisqualified = status === "DISQUALIFIED";
  const appealStatus = (
    detail as { appealStatus?: "PENDING" | "UPHELD" | "OVERTURNED" }
  ).appealStatus;
  const canOverturn =
    Boolean(dqId) && isDisqualified && appealStatus !== "OVERTURNED";

  const handleConfirmDisqualify = async (values: DisqualifyFormValues) => {
    const res = await disqualifyMutation.mutateAsync({
      submissionId: detail.id,
      payload: values,
    });
    setDisqualifyOpen(false);
    refetch();
    return res;
  };

  const handleConfirmOverturn = async (values: OverturnFormValues) => {
    if (!dqId) return;
    const res = await overturnMutation.mutateAsync({
      disqualificationId: dqId,
      payload: { reason: values.overturnReason },
    });
    setOverturnOpen(false);
    refetch();
    return res;
  };

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 dark:bg-transparent">
      {/* Breadcrumb + back */}
      <div className="sd-fade mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <ArrowBackOutlinedIcon fontSize="small" /> Back
        </button>
        <nav className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
          <span>Submissions</span>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">
            {detail.teamName || "Detail"}
          </span>
        </nav>
      </div>

      {/* Hero */}
      <div className="sd-rise relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <span
          className={[
            "sd-ribbon absolute inset-y-0 left-0 w-1.5",
            statusRibbon(status),
          ].join(" ")}
        />
        <div className="flex flex-col gap-5 pl-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {detail.teamName || "Submission"}
              </h1>
              {isDisqualified ? (
                <DisqualificationStatusBadge appealStatus={appealStatus} />
              ) : (
                <span
                  className={`inline-flex rounded-lg border px-3 py-1 text-xs font-bold ${getSubmissionStatusColor(status)}`}
                >
                  {status}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <EventOutlinedIcon sx={{ fontSize: 16 }} />
                {detail.roundName || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CategoryOutlinedIcon sx={{ fontSize: 16 }} />
                {detail.trackName || "No track"}
              </span>
              {detail.eventName && (
                <span className="inline-flex items-center gap-1.5">
                  {detail.eventName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <TagOutlinedIcon sx={{ fontSize: 15 }} />
                {detail.id.substring(0, 8)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<GroupsOutlinedIcon />}
              onClick={() => navigate(`/coordinator/teams/${detail.teamId}`)}
              sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 600 }}
            >
              View team
            </Button>

            {canOverturn && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<RestoreOutlinedIcon />}
                onClick={() => setOverturnOpen(true)}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  boxShadow: "none",
                  fontWeight: 700,
                }}
              >
                Overturn
              </Button>
            )}

            {!isDisqualified &&
              (isScorable ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<GavelOutlinedIcon />}
                  onClick={() => setDisqualifyOpen(true)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    boxShadow: "none",
                    fontWeight: 700,
                  }}
                >
                  Disqualify
                </Button>
              ) : (
                <Tooltip
                  title="Only submitted submissions can be disqualified."
                  arrow
                >
                  <span>
                    <Button
                      variant="contained"
                      color="error"
                      disabled
                      startIcon={<GavelOutlinedIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        boxShadow: "none",
                        fontWeight: 700,
                      }}
                    >
                      Disqualify
                    </Button>
                  </span>
                </Tooltip>
              ))}
          </div>
        </div>
      </div>

      {/* Body: deliverables + meta */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main */}
        <div className="space-y-6 lg:col-span-2">
          <section
            className="sd-rise sd-card rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
            style={{ animationDelay: "80ms" }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <LinkOutlinedIcon fontSize="small" /> Deliverable links
            </h2>
            <SubmissionLinksPreview links={detail.links || []} />
          </section>

          {detail.note && (
            <section
              className="sd-rise sd-card rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10"
              style={{ animationDelay: "140ms" }}
            >
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                <StickyNote2OutlinedIcon fontSize="small" /> Submitter note
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-900 dark:text-amber-100/90">
                {detail.note}
              </p>
            </section>
          )}
        </div>

        {/* Right / meta */}
        <div className="space-y-6">
          <section
            className="sd-rise sd-card rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
            style={{ animationDelay: "110ms" }}
          >
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Overview
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <MetaRow
                icon={<TagOutlinedIcon fontSize="small" />}
                label="Attempt number"
                value={detail.submissionNumber}
              />
              <MetaRow
                icon={<ScheduleOutlinedIcon fontSize="small" />}
                label="Submitted at"
                value={
                  detail.submittedAt
                    ? new Date(detail.submittedAt).toLocaleString()
                    : "Not submitted yet"
                }
              />
              <MetaRow
                icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                label="Team leader"
                value={detail.leaderName || "—"}
              />
              {detail.roundSubmissionLocked && (
                <MetaRow
                  icon={<LockOutlinedIcon fontSize="small" />}
                  label="Round submission locked"
                  value={
                    <span className="text-red-600 dark:text-red-400">
                      Locked at{" "}
                      {detail.roundSubmissionLockedAt
                        ? new Date(
                            detail.roundSubmissionLockedAt,
                          ).toLocaleString()
                        : "Unknown time"}
                    </span>
                  }
                />
              )}
              <MetaRow
                icon={<TagOutlinedIcon fontSize="small" />}
                label="Submission ID"
                value={
                  <span className="break-all font-mono text-xs">
                    {detail.id}
                  </span>
                }
              />
            </div>
          </section>
        </div>
      </div>

      {disqualifyOpen && (
        <DisqualifySubmissionDialog
          open={disqualifyOpen}
          onClose={() => setDisqualifyOpen(false)}
          submissionId={detail.id}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleConfirmDisqualify}
        />
      )}

      {overturnOpen && dqId && (
        <OverturnDisqualificationDialog
          open={overturnOpen}
          onClose={() => setOverturnOpen(false)}
          disqualificationId={dqId}
          isPending={overturnMutation.isPending}
          onConfirm={handleConfirmOverturn}
        />
      )}
    </div>
  );
}
