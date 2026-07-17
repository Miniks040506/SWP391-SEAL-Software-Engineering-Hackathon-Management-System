import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import type { SubmissionLinkResponse } from "@/types/submission.types";

type MentorSubmissionLinksListProps = {
  links: SubmissionLinkResponse[];
};

export const MentorSubmissionLinksList = ({ links }: MentorSubmissionLinksListProps) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Deliverables
        </h3>
      </div>

      <SubmissionLinksPreview links={links} />
    </div>
  );
};
