import { useState } from "react";
import { Button } from "@mui/material";
import { submissionApi } from "@/api/submission.api";
import type { SubmissionLinkResponse } from "@/types/submission.types";

type Props = {
  links: SubmissionLinkResponse[];
  canDelete?: boolean;
  deletingLinkId?: string | null;
  onDelete?: (link: SubmissionLinkResponse) => void;
};

const formatBytes = (bytes?: number | null) => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function SubmissionLinksPreview({
  links,
  canDelete = false,
  deletingLinkId,
  onDelete,
}: Props) {
  const [openingLinkId, setOpeningLinkId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const openStoredFile = async (link: SubmissionLinkResponse) => {
    setOpeningLinkId(link.id);
    setOpenError(null);
    try {
      const result = await submissionApi.createSubmissionFileDownloadUrl(link.id);
      const url = new URL(result.downloadUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("The storage provider returned an unsafe download URL.");
      }
      const anchor = document.createElement("a");
      anchor.href = url.toString();
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      setOpenError((error as { message?: string })?.message || "Evidence could not be opened.");
    } finally {
      setOpeningLinkId(null);
    }
  };

  if (!links || links.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 italic">No links provided for this submission.</p>;
  }

  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.id} className="flex flex-col p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {link.label || link.linkType}
              {link.isPrimary && (
                <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-md uppercase font-extrabold tracking-wider">
                  Primary
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 uppercase">
              {link.linkType}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
            {link.originalFileName || link.url}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {link.storageProvider && <span>{link.storageProvider.replaceAll("_", " ")}</span>}
            {link.contentType && <span>{link.contentType}</span>}
            {formatBytes(link.fileSizeBytes) && <span>{formatBytes(link.fileSizeBytes)}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {link.storageProvider === "AWS_S3" || link.objectKey ? (
              <Button
                size="small"
                variant="outlined"
                disabled={openingLinkId === link.id}
                onClick={() => openStoredFile(link)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                {openingLinkId === link.id ? "Opening..." : "Open file"}
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Open link
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                size="small"
                color="error"
                disabled={deletingLinkId === link.id}
                onClick={() => onDelete(link)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Delete
              </Button>
            )}
          </div>
          {link.repoMetadata !== null &&
            typeof link.repoMetadata === "object" &&
            (() => {
              const meta = link.repoMetadata as Record<string, unknown>;
              return (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Repository Metadata
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries(meta).map(([key, value]) => (
                      <div key={key} className="contents">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{key}</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          }
        </li>
      ))}
      {openError && <li className="text-sm text-rose-600 dark:text-rose-400">{openError}</li>}
    </ul>
  );
}
