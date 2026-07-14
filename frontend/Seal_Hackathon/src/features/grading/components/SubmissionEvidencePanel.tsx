import { type ReactNode } from "react";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CodeIcon from "@mui/icons-material/Code";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import DescriptionIcon from "@mui/icons-material/Description";
import VideocamIcon from "@mui/icons-material/Videocam";
import LinkIcon from "@mui/icons-material/Link";

import type { SubmissionLinkResponse } from "@/types/submission.types";

type Props = {
  links: SubmissionLinkResponse[];
};

const LINK_TYPE_CONFIG: Record<
  string,
  { icon: ReactNode; color: string; bgColor: string }
> = {
  REPOSITORY: {
    icon: <CodeIcon fontSize="small" />,
    color: "#6366f1",
    bgColor: "rgba(99,102,241,0.08)",
  },
  DEMO: {
    icon: <PlayCircleIcon fontSize="small" />,
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.08)",
  },
  SLIDE: {
    icon: <SlideshowIcon fontSize="small" />,
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
  },
  REPORT: {
    icon: <DescriptionIcon fontSize="small" />,
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.08)",
  },
  VIDEO: {
    icon: <VideocamIcon fontSize="small" />,
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.08)",
  },
  OTHER: {
    icon: <LinkIcon fontSize="small" />,
    color: "#6b7280",
    bgColor: "rgba(107,114,128,0.08)",
  },
};

const getConfig = (linkType: string) =>
  LINK_TYPE_CONFIG[linkType] || LINK_TYPE_CONFIG["OTHER"];

export const SubmissionEvidencePanel = ({ links }: Props) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Typography
        variant="h6"
        className="mb-4 font-extrabold text-gray-900 dark:text-slate-100"
      >
        Submission Evidence
      </Typography>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => {
          const config = getConfig(link.linkType);
          return (
            <Box
              key={link.id}
              className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-slate-50 p-4 transition-all dark:border-slate-800 dark:bg-slate-950"
              sx={{
                "&:hover": {
                  borderColor: config.color,
                  boxShadow: `0 0 0 1px ${config.color}20`,
                },
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <Chip
                      label={link.linkType}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "10px",
                        fontWeight: 800,
                        mb: 0.5,
                        color: config.color,
                        bgcolor: config.bgColor,
                        border: `1px solid ${config.color}30`,
                      }}
                    />
                    <p
                      className="w-full truncate overflow-hidden text-sm font-medium text-gray-900 dark:text-slate-200"
                      title={link.originalFileName || link.url}
                    >
                      {link.originalFileName ||
                        (link.url.length > 40
                          ? link.url.substring(0, 40) + "..."
                          : link.url)}
                    </p>
                  </div>
                </div>
                <Button
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    flexShrink: 0,
                    minWidth: "auto",
                    px: 1.5,
                    py: 0.5,
                    fontSize: "12px",
                  }}
                >
                  Open
                </Button>
              </div>

              {link.repoMetadata && (
                <div className="flex flex-wrap gap-2 pl-[52px] text-xs text-gray-500 dark:text-slate-400">
                  {link.repoMetadata.primaryLanguage && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-medium shadow-sm dark:bg-slate-800">
                      {link.repoMetadata.primaryLanguage}
                    </span>
                  )}
                  {link.repoMetadata.stars !== undefined && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-medium shadow-sm dark:bg-slate-800">
                      ⭐ {link.repoMetadata.stars}
                    </span>
                  )}
                  {link.repoMetadata.forks !== undefined && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-medium shadow-sm dark:bg-slate-800">
                      🍴 {link.repoMetadata.forks}
                    </span>
                  )}
                  {link.repoMetadata.isPrivate !== undefined && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-medium shadow-sm dark:bg-slate-800">
                      {link.repoMetadata.isPrivate ? "🔒 Private" : "🌐 Public"}
                    </span>
                  )}
                </div>
              )}
            </Box>
          );
        })}
      </div>
    </div>
  );
};
