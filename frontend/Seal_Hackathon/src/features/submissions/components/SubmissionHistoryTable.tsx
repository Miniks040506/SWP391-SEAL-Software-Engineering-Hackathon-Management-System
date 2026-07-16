import { useState } from "react";
import { Button } from "@mui/material";
import { submissionApi } from "@/api/submission.api";
import type {
  SubmissionAttemptEvidenceResponse,
  SubmissionAttemptResponse,
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
    return <p className="py-4 text-center text-sm text-slate-500">Loading submission history...</p>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-5 text-center">
        <p className="text-sm text-rose-600 dark:text-rose-400">
          {(error as { message?: string })?.message || "Submission history could not be loaded."}
        </p>
        {onRetry && <Button onClick={onRetry}>Retry</Button>}
      </div>
    );
  }

  if (!history.length) {
    return (
      <p className="py-4 text-center text-sm italic text-slate-400 dark:text-slate-500">
        No finalized submission attempts yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            {["#", "Status", "Submitted At", "Evidence", "Note"].map((heading) => (
              <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900/50">
          {history.map((entry) => (
            <tr key={entry.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-3 align-top text-sm font-bold text-slate-600 dark:text-slate-400">
                #{entry.attemptNumber}
              </td>
              <td className="px-4 py-3 align-top">
                <SubmissionStatusBadge status={entry.status} size="sm" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-400">
                {entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : "—"}
              </td>
              <td className="min-w-72 px-4 py-3 align-top text-sm text-slate-600 dark:text-slate-400">
                <ul className="space-y-2">
                  {entry.evidence.map((evidence) => (
                    <li key={evidence.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {evidence.originalFileName || evidence.label || evidence.linkType}
                        </span>
                        <Button
                          size="small"
                          disabled={openingEvidenceId === evidence.id}
                          onClick={() => openEvidence(entry.submissionId, evidence)}
                        >
                          {openingEvidenceId === evidence.id ? "Opening..." : "Open"}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{evidence.linkType}</span>
                        <span>{evidence.storageProvider.replaceAll("_", " ")}</span>
                        {evidence.contentType && <span>{evidence.contentType}</span>}
                        {formatBytes(evidence.fileSizeBytes) && <span>{formatBytes(evidence.fileSizeBytes)}</span>}
                        {evidence.repoMetadata?.repoName && <span>{evidence.repoMetadata.repoName}</span>}
                        {evidence.repoMetadata?.primaryLanguage && <span>{evidence.repoMetadata.primaryLanguage}</span>}
                      </div>
                    </li>
                  ))}
                  {!entry.evidence.length && <li className="italic">No evidence captured.</li>}
                </ul>
              </td>
              <td className="max-w-xs truncate px-4 py-3 align-top text-sm text-slate-500 dark:text-slate-400">
                {entry.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openError && (
        <p className="px-4 py-3 text-sm text-rose-600 dark:text-rose-400">{openError}</p>
      )}
    </div>
  );
}
