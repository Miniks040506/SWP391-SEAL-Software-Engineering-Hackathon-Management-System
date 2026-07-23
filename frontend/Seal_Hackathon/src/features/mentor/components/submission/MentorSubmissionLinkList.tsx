import type { CSSProperties } from "react";

import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import type { SubmissionLinkResponse } from "@/types/submission.types";

type MentorSubmissionLinksListProps = {
  links: SubmissionLinkResponse[];
};

/**
 * Deliverables section. Rendering (S3 downloads, Drive links, repository
 * evidence) is delegated to the shared SubmissionLinksPreview so all
 * download/link behaviors stay identical.
 */
export const MentorSubmissionLinksList = ({ links }: MentorSubmissionLinksListProps) => {
  if (!links || links.length === 0) return null;

  return (
    <section
      className="mt-fade-up rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900"
      style={{ "--mt-stagger": 5 } as CSSProperties}
    >
      <div className="mb-4 flex items-center gap-2">
        <FolderOpenOutlinedIcon
          sx={{ fontSize: 18 }}
          className="text-blue-600 dark:text-blue-400"
        />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Deliverables ({links.length})
        </h3>
      </div>

      <SubmissionLinksPreview links={links} />
    </section>
  );
};
