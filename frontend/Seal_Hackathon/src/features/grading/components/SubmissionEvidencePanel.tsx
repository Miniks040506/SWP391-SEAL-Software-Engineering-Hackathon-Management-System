import type { CSSProperties } from "react";

import Typography from "@mui/material/Typography";

import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import type { SubmissionLinkResponse } from "@/types/submission.types";
import "@/features/judge/styles/judge.css";

type Props = {
  links: SubmissionLinkResponse[];
};

export const SubmissionEvidencePanel = ({ links }: Props) => {
  if (!links || links.length === 0) return null;

  return (
    <div
      className="jd-fade-up rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      style={{ "--jd-stagger": 2 } as CSSProperties}
    >
      <Typography
        variant="h6"
        className="mb-4 font-extrabold text-gray-900 dark:text-slate-100"
      >
        Submission Evidence
      </Typography>
      <SubmissionLinksPreview links={links} />
    </div>
  );
};
