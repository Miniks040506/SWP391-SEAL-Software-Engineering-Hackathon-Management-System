import React from "react";
import type { SubmissionDetailResponse } from "@/types/submission.types";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkIcon from "@mui/icons-material/Link";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

interface CalibrationSubmissionPreviewProps {
    submission?: SubmissionDetailResponse;
    isLoading?: boolean;
}

const getLinkIcon = (type: string) => {
    switch (type.toUpperCase()) {
        case "REPOSITORY":
            return <GitHubIcon fontSize="small" />;
        case "DEMO":
            return <PlayCircleOutlineIcon fontSize="small" />;
        case "SLIDE":
            return <SlideshowIcon fontSize="small" />;
        case "REPORT":
            return <ArticleOutlinedIcon fontSize="small" />;
        default:
            return <LinkIcon fontSize="small" />;
    }
};

export const CalibrationSubmissionPreview = ({ submission, isLoading }: CalibrationSubmissionPreviewProps) => {
    if (isLoading) {
        return (
            <div className="flex animate-pulse flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-20 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-700" />
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                Sample submission not available.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {/* Header / Basic Info */}
            <div className="border-b border-slate-100 pb-5 dark:border-slate-800">
                <h2 className="mb-2 text-xl font-black text-slate-900 dark:text-white">
                    Sample Submission Preview
                </h2>
                <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Team: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">{submission.teamName || "N/A"}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Event: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">{submission.eventName || "N/A"}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Track: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">{submission.trackName || "N/A"}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Round: </span>
                        <span className="font-medium text-slate-900 dark:text-slate-200">{submission.roundName || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Note / Description */}
            <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <DescriptionOutlinedIcon fontSize="small" className="text-slate-500" />
                    Notes & Description
                </h3>
                {submission.note ? (
                    <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                        {submission.note}
                    </div>
                ) : (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500">No description provided.</p>
                )}
            </div>

            {/* Links */}
            <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <LinkIcon fontSize="small" className="text-slate-500" />
                    Deliverable Links
                </h3>
                {submission.links && submission.links.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {submission.links.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/20"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-400">
                                        {getLinkIcon(link.linkType)}
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-200">
                                            {link.label || link.linkType}
                                        </span>
                                        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                            {link.url}
                                        </span>
                                    </div>
                                </div>
                                <OpenInNewIcon fontSize="small" className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100 dark:text-slate-500" />
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                        No links available.
                    </div>
                )}
            </div>
        </div>
    );
};
