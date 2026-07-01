import { CircularProgress } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";

import { usePublicEventAwardsQuery, usePublicEventDetailQuery } from "../hooks/usePublicEventQueries";
import type { PrizeResponse } from "@/types/prize.types";

export const PublicEventAwardsSection = ({ eventId }: { eventId: string }) => {
  const { data: event, isLoading: isLoadingEvent } = usePublicEventDetailQuery(eventId);
  const { data: awards = [], isLoading: isLoadingAwards } = usePublicEventAwardsQuery(eventId);

  if (isLoadingEvent || isLoadingAwards) {
    return (
      <div className="flex h-40 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  const isPublished = event?.status === "PUBLISHED" || event?.status === "COMPLETED";

  if (!isPublished) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <EmojiEventsOutlinedIcon fontSize="large" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-700 dark:text-slate-300">
          Awards Pending
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Awards will be visible after results are published.
        </p>
      </div>
    );
  }

  if (awards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <WorkspacePremiumOutlinedIcon fontSize="large" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-700 dark:text-slate-300">
          No Awards Yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No prizes have been awarded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((prize: PrizeResponse) => (
          <div
            key={prize.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 dark:opacity-10">
              <EmojiEventsOutlinedIcon sx={{ fontSize: 120 }} />
            </div>

            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {prize.trackName ? `Track: ${prize.trackName}` : "Overall"}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                    {prize.title}
                  </h3>
                  <div className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-500">
                    Rank {prize.rankPosition}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <GroupOutlinedIcon fontSize="small" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Winner</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {prize.awardedTeamName || "Unknown Team"}
                    </p>
                  </div>
                </div>

                {(prize.value !== undefined || prize.sponsorName) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {prize.value !== undefined ? (
                        <AttachMoneyOutlinedIcon fontSize="small" />
                      ) : (
                        <WorkspacePremiumOutlinedIcon fontSize="small" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {prize.value !== undefined ? "Value" : "Sponsor"}
                      </p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {prize.value !== undefined
                          ? `${prize.value.toLocaleString()} ${prize.currency || ""}`
                          : prize.sponsorName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {prize.awardedAt && (
                <div className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                  Awarded on {new Date(prize.awardedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
