import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import CodeIcon from "@mui/icons-material/Code";
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

import type { SubmissionLinkResponse } from "@/types/submission.types";

type MentorSubmissionLinksListProps = {
  links: SubmissionLinkResponse[];
};

function getLinkIcon(linkType: string) {
  switch (linkType) {
    case "REPOSITORY":
      return <CodeIcon className="text-blue-500" />;
    case "DEMO":
    case "VIDEO":
      return <PlayCircleOutlinedIcon className="text-red-500" />;
    case "REPORT":
    case "SLIDE":
      return <DescriptionOutlinedIcon className="text-orange-500" />;
    default:
      return <LinkIcon className="text-gray-500" />;
  }
}

export const MentorSubmissionLinksList = ({ links }: MentorSubmissionLinksListProps) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deliverables</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Card key={link.id} variant="outlined" className="flex flex-col justify-between p-4 dark:border-slate-700 dark:bg-[#1e293b]">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-gray-50 p-2 dark:bg-slate-800">
                {getLinkIcon(link.linkType)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {link.label || link.linkType}
                  {link.isPrimary && (
                    <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Primary
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-slate-400">
                  {link.url}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outlined"
                size="small"
                endIcon={<OpenInNewIcon />}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Link
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};