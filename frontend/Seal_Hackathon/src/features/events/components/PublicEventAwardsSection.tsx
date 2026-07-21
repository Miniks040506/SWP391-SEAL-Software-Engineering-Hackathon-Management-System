import { CircularProgress } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MilitaryTechOutlinedIcon from "@mui/icons-material/MilitaryTechOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { format, isValid, parseISO } from "date-fns";

import {
  usePublicEventAwardsQuery,
  usePublicEventDetailQuery,
} from "../hooks/usePublicEventQueries";
import type { PrizeResponse } from "@/types/prize.types";

type RankTier = {
  label: string;
  band: string;
  medallion: string;
  medallionRing: string;
  rankText: string;
  cardBorder: string;
  glow: string;
};

const TIERS: Record<"gold" | "silver" | "bronze" | "other", RankTier> = {
  gold: {
    label: "Champion",
    band: "bg-blue-600",
    medallion: "bg-blue-50 text-blue-700",
    medallionRing: "ring-blue-100 dark:ring-blue-500/30",
    rankText: "text-blue-700 dark:text-blue-300",
    cardBorder:
      "border-blue-200 hover:border-blue-400 dark:border-blue-500/40 dark:hover:border-blue-400",
    glow: "shadow-lg shadow-blue-500/10",
  },
  silver: {
    label: "Runner-up",
    band: "bg-slate-300 dark:bg-slate-700",
    medallion:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    medallionRing: "ring-slate-200 dark:ring-slate-500/30",
    rankText: "text-slate-500 dark:text-slate-400",
    cardBorder:
      "border-slate-300 hover:border-slate-400 dark:border-slate-600/50 dark:hover:border-slate-500",
    glow: "shadow-lg shadow-slate-500/10",
  },
  bronze: {
    label: "Third Place",
    band: "bg-slate-400 dark:bg-slate-600",
    medallion:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    medallionRing: "ring-slate-200 dark:ring-slate-600/50",
    rankText: "text-slate-600 dark:text-slate-300",
    cardBorder:
      "border-slate-300 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-500/50",
    glow: "shadow-lg shadow-slate-500/10",
  },
  other: {
    label: "Awarded",
    band: "bg-blue-500",
    medallion:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    medallionRing: "ring-blue-200 dark:ring-blue-500/30",
    rankText: "text-blue-600 dark:text-blue-400",
    cardBorder:
      "border-blue-200 hover:border-blue-400 dark:border-blue-500/30 dark:hover:border-blue-500/50",
    glow: "shadow-lg shadow-blue-500/10",
  },
};

function getTier(rankPosition?: number): RankTier {
  if (rankPosition === 1) return TIERS.gold;
  if (rankPosition === 2) return TIERS.silver;
  if (rankPosition === 3) return TIERS.bronze;
  return TIERS.other;
}

function formatAwardedDate(value?: string) {
  if (!value) return null;

  const date = parseISO(value);
  if (!isValid(date)) return null;

  return format(date, "dd MMM yyyy");
}

function AwardCard({
  prize,
  featured = false,
}: {
  prize: PrizeResponse;
  featured?: boolean;
}) {
  const tier = getTier(prize.rankPosition);
  const awardedDate = formatAwardedDate(prize.awardedAt);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[1.5rem] border bg-white transition-all duration-300 hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:bg-slate-900 ${featured ? "sm:col-span-2" : ""} ${tier.cardBorder} ${tier.glow}`}
    >
      {/* Tier band */}
      <div className={`h-1.5 ${tier.band}`} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-4 ${tier.medallion} ${tier.medallionRing}`}
          >
            <EmojiEventsIcon style={{ fontSize: 28 }} />
          </div>

          <div className="flex flex-col items-end gap-1.5 text-right">
            <span
              className={`text-xs font-black uppercase tracking-[0.16em] ${tier.rankText}`}
            >
              {tier.label} · place {prize.rankPosition ?? "Not ranked"}
            </span>

            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              {prize.trackName ?? "Overall"}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
            Winner
          </p>

          <h3 className="mt-1 flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="line-clamp-2">
              {prize.awardedTeamName || "Unknown Team"}
            </span>
            <VerifiedOutlinedIcon
              style={{ fontSize: 18 }}
              className="shrink-0 text-blue-500"
            />
          </h3>

          {prize.title && (
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
              {prize.title}
            </p>
          )}
        </div>

        {prize.value !== undefined && (
          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 dark:bg-slate-950/50">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
              Prize value
            </p>
            <p className="mt-0.5 text-2xl font-black tabular-nums tracking-tight text-gray-900 dark:text-white">
              {prize.value.toLocaleString()}
              <span className="ml-1.5 text-sm font-bold text-gray-400 dark:text-slate-500">
                {prize.currency || "VND"}
              </span>
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 dark:border-slate-800 [&:not(:first-child)]:mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
            <WorkspacePremiumOutlinedIcon
              style={{ fontSize: 15 }}
              className="text-blue-500/80"
            />
            Certificate
          </span>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
            <MilitaryTechOutlinedIcon
              style={{ fontSize: 15 }}
              className="text-purple-500/80"
            />
            Medal
          </span>

          {prize.sponsorName && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
              <GroupsOutlinedIcon
                style={{ fontSize: 15 }}
                className="text-emerald-500/80"
              />
              {prize.sponsorName}
            </span>
          )}

          {awardedDate && (
            <span className="ml-auto text-xs font-medium text-gray-400 dark:text-slate-500">
              {awardedDate}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export const PublicEventAwardsSection = ({ eventId }: { eventId: string }) => {
  const { data: event, isLoading: isLoadingEvent } =
    usePublicEventDetailQuery(eventId);
  const { data: awards = [], isLoading: isLoadingAwards } =
    usePublicEventAwardsQuery(eventId);

  if (isLoadingEvent || isLoadingAwards) {
    return (
      <div className="flex h-40 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  const isPublished =
    Boolean(event?.resultPublishedAt) || event?.status === "COMPLETED";

  if (!isPublished && awards.length === 0) {
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

  const sorted = [...awards].sort(
    (a, b) => (a.rankPosition ?? 99) - (b.rankPosition ?? 99),
  );

  return (
    <div className="grid grid-flow-dense gap-5 sm:grid-cols-2">
      {sorted.map((prize, index) => (
        <AwardCard
          key={prize.id}
          prize={prize}
          featured={sorted.length > 2 && index === 0}
        />
      ))}
    </div>
  );
};
