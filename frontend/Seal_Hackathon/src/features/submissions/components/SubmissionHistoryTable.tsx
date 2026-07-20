import { useState } from "react";
import { Button } from "@mui/material";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { submissionApi } from "@/api/submission.api";
import type {
  SubmissionAttemptEvidenceResponse,
  SubmissionAttemptResponse,
  SubmissionStatus,
} from "@/types/submission.types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

type Props = {
  history: SubmissionAttemptResponse[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
};

const formatBytes = (bytes?: number | null) => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const safeHttpUrl = (raw?: string | null) => {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const openUrl = (rawUrl: string) => {
  const url = safeHttpUrl(rawUrl);
  if (!url) throw new Error("The provider returned an unsafe evidence URL.");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

// The timeline node tints by status so the outcome reads at a glance, while the
// number + badge keep the meaning available without relying on colour alone.
const nodeTone: Record<string, string> = {
  SUBMITTED:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
  LATE: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
};
const defaultNodeTone =
  "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

function EvidenceIcon({
  evidence,
}: {
  evidence: SubmissionAttemptEvidenceResponse;
}) {
  const iconStyle = { fontSize: 18 } as const;
  if (evidence.storageProvider === "GITHUB")
    return <GitHubIcon style={iconStyle} />;
  if (evidence.storageProvider === "GOOGLE_DRIVE")
    return <CloudOutlinedIcon style={iconStyle} />;
  if (evidence.storageProvider === "AWS_S3")
    return <InsertDriveFileOutlinedIcon style={iconStyle} />;
  return evidence.url ? (
    <LinkRoundedIcon style={iconStyle} />
  ) : (
    <InsertDriveFileOutlinedIcon style={iconStyle} />
  );
}

export function SubmissionHistoryTable({ history, loading, error, onRetry }: Props) {
  const [openingEvidenceId, setOpeningEvidenceId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const openEvidence = async (
    submissionId: string,
    evidence: SubmissionAttemptEvidenceResponse,
  ) => {
    setOpeningEvidenceId(evidence.id);
    setOpenError(null);
    try {
      if (evidence.storageProvider === "AWS_S3") {
        const result = await submissionApi.createSubmissionAttemptFileDownloadUrl(
          submissionId,
          evidence.id,
        );
        openUrl(result.downloadUrl);
      } else if (evidence.url) {
        openUrl(evidence.url);
      } else {
        throw new Error("This historical evidence is no longer available from its provider.");
      }
    } catch (openFailure) {
      setOpenError(
        (openFailure as { message?: string })?.message || "Evidence could not be opened.",
      );
    } finally {
      setOpeningEvidenceId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-live="polite"
        aria-label="Loading submission history"
      >
        {[0, 1].map((key) => (
          <div key={key} className="flex gap-4">
            <div className="size-9 shrink-0 rounded-full bg-slate-200 motion-safe:animate-pulse dark:bg-slate-800" />
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-4 w-40 rounded bg-slate-200 motion-safe:animate-pulse dark:bg-slate-800" />
              <div className="mt-3 h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
        <ErrorOutlineRoundedIcon
          className="text-rose-500 dark:text-rose-400"
          style={{ fontSize: 28 }}
        />
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
          {(error as { message?: string })?.message ||
            "Submission history could not be loaded."}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
          <HistoryRoundedIcon style={{ fontSize: 24 }} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No finalized attempts yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Once your team submits this round, each attempt will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {openError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <ErrorOutlineRoundedIcon style={{ fontSize: 18 }} className="mt-0.5 shrink-0" />
          <span>{openError}</span>
        </p>
      )}

      <ol className="space-y-4">
        {history.map((entry, index) => (
          <li key={entry.id} className="flex gap-4">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={[
                  "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold tabular-nums",
                  nodeTone[entry.status as SubmissionStatus] ?? defaultNodeTone,
                ].join(" ")}
              >
                {entry.attemptNumber}
              </span>
              {index < history.length - 1 && (
                <span
                  aria-hidden
                  className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-800"
                />
              )}
            </div>

            {/* Attempt card */}
            <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Attempt #{entry.attemptNumber}
                  </span>
                  <SubmissionStatusBadge status={entry.status} size="sm" />
                </div>
                <span className="text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
                  {formatDateTime(entry.submittedAt)}
                </span>
              </div>

              {entry.note && (
                <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm italic text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {entry.note}
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Evidence
                  {entry.evidence.length > 0 && (
                    <span className="tabular-nums"> · {entry.evidence.length}</span>
                  )}
                </p>

                {entry.evidence.length > 0 ? (
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {entry.evidence.map((evidence) => {
                      const size = formatBytes(evidence.fileSizeBytes);
                      const meta = [
                        evidence.linkType,
                        evidence.storageProvider.replaceAll("_", " "),
                        evidence.contentType,
                        size,
                        evidence.repoMetadata?.repoName,
                        evidence.repoMetadata?.primaryLanguage,
                      ].filter(Boolean);
                      return (
                        <li
                          key={evidence.id}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                            <EvidenceIcon evidence={evidence} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="min-w-0 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {evidence.originalFileName ||
                                  evidence.label ||
                                  evidence.linkType}
                              </span>
                              <button
                                type="button"
                                disabled={openingEvidenceId === evidence.id}
                                onClick={() =>
                                  openEvidence(entry.submissionId, evidence)
                                }
                                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 dark:text-blue-400 dark:hover:bg-blue-500/10"
                              >
                                <OpenInNewRoundedIcon style={{ fontSize: 14 }} />
                                {openingEvidenceId === evidence.id
                                  ? "Opening…"
                                  : "Open"}
                              </button>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                              {meta.map((item, metaIndex) => (
                                <span
                                  key={`${evidence.id}-${metaIndex}`}
                                  className="flex items-center gap-2 before:text-slate-300 first:before:content-none before:content-['·'] dark:before:text-slate-600"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm italic text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    No evidence captured.
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
