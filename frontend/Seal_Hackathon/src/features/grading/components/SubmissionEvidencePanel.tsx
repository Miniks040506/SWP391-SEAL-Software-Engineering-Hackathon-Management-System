import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";

import type { SubmissionLinkResponse } from "@/types/submission.types";

type Props = {
  links: SubmissionLinkResponse[];
};

export const SubmissionEvidencePanel = ({ links }: Props) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Typography variant="h6" className="mb-4 font-extrabold text-gray-900 dark:text-slate-100">
        Submission Evidence
      </Typography>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Box
            component="a"
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-slate-50 p-4 transition-all dark:border-slate-800 dark:bg-slate-950"
            sx={{
              cursor: "pointer",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "primary.main",
              },
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                <OpenInNewIcon fontSize="small" className="text-gray-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{link.linkType}</p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-200" title={link.originalFileName || link.url}>
                  {link.originalFileName || (link.url.length > 40 ? link.url.substring(0, 40) + "..." : link.url)}
                </p>
                {link.repoMetadata && (
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">
                    {link.repoMetadata.primaryLanguage && `${link.repoMetadata.primaryLanguage} • `}
                    {link.repoMetadata.stars !== undefined && `${link.repoMetadata.stars} ⭐ • `}
                    {link.repoMetadata.forks !== undefined && `${link.repoMetadata.forks} forks`}
                  </p>
                )}
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
};
