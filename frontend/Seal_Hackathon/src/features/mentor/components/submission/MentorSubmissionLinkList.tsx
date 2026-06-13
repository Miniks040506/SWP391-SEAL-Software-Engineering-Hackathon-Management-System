import CodeIcon from "@mui/icons-material/Code";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";

import type { SubmissionLinkResponse } from "@/types/submission.types";

type MentorSubmissionLinksListProps = {
  links: SubmissionLinkResponse[];
};

function getLinkStyles(linkType: string) {
  switch (linkType) {
    case "REPOSITORY":
      return { icon: <CodeIcon />, bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" };
    case "DEMO":
    case "VIDEO":
      return { icon: <PlayCircleOutlinedIcon />, bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" };
    case "REPORT":
    case "SLIDE":
      return { icon: <DescriptionOutlinedIcon />, bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" };
    default:
      return { icon: <LinkIcon />, bg: "bg-gray-100 dark:bg-slate-800", text: "text-gray-600 dark:text-gray-400" };
  }
}

export const MentorSubmissionLinksList = ({ links }: MentorSubmissionLinksListProps) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
          Deliverables
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((link) => {
          const styles = getLinkStyles(link.linkType);

          return (
            <Card
              key={link.id}
              variant="outlined"
              className="flex flex-col justify-between rounded-2xl border-gray-100 bg-white p-5 dark:border-slate-700 dark:bg-[#1e293b]"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-3 ${styles.bg} ${styles.text}`}>
                  {styles.icon}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-gray-900 dark:text-white truncate">
                      {link.label || link.linkType}
                    </p>
                    {link.isPrimary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                      />
                    )}
                  </div>
                  
                  <p className="mt-1 truncate text-sm font-medium text-gray-500 dark:text-slate-400">
                    {link.url}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-50 pt-4 dark:border-slate-700/50">
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNewIcon />}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Open Link
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};