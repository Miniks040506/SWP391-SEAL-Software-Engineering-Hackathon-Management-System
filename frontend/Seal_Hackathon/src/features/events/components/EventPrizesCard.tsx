import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import type { Event } from "@/types/event.types";

type Prize = Event["prizes"][number];

const PRIZE_MAX_PREVIEW = 2;

// ─── Shared rank color helpers ────────────────────────────────────────────────
const getRankColors = (rank: string) => {
  const key = rank.toLowerCase();
  const isChampion = key === "champion";
  const isRunnerUp  = key === "runner up";
  return {
    dotColor:  isChampion ? "bg-amber-400"   : isRunnerUp ? "bg-slate-400"  : "bg-orange-400",
    rankColor: isChampion ? "text-amber-500" : isRunnerUp ? "text-slate-400" : "text-orange-400",
    isChampion,
  };
};

// ─── Shared perks block ───────────────────────────────────────────────────────
const PrizePerks = ({ isChampion }: { isChampion: boolean }) => (
  <div className="space-y-2 bg-white rounded-lg p-3 border border-gray-100 text-xs text-gray-500 font-medium">
    <div className="flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500" />
      <span>Includes high-tier physical structural Trophy presentation</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500" />
      <span>Direct priority placement slot to Final Exhibition Venue</span>
    </div>
    {isChampion && (
      <div className="flex items-center gap-2">
        <CardGiftcardIcon style={{ fontSize: 13 }} className="text-emerald-500" />
        <span className="text-emerald-600 font-semibold">
          Bonus: Sponsor Premium Mechanical Keyboard Kit
        </span>
      </div>
    )}
  </div>
);

// ─── Shared awards row ────────────────────────────────────────────────────────
const PrizeAwards = () => (
  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium border-t border-gray-100/80 pt-3">
    <div className="flex items-center gap-1.5">
      <WorkspacePremiumIcon style={{ fontSize: 14 }} className="text-blue-500/80" />
      <span>Certificate</span>
    </div>
    <div className="flex items-center gap-1.5">
      <MilitaryTechIcon style={{ fontSize: 14 }} className="text-purple-500/80" />
      <span>Medal</span>
    </div>
  </div>
);

// ─── PrizeRow (accordion, dùng trong card preview) ────────────────────────────
interface PrizeRowProps {
  prize: Prize;
  expanded: boolean;
  onToggle: () => void;
}

const PrizeRow = ({ prize, expanded, onToggle }: PrizeRowProps) => {
  const { dotColor, rankColor, isChampion } = getRankColors(prize.rank);

  return (
    <div
      onClick={onToggle}
      className={`group cursor-pointer rounded-xl border transition-all duration-300 p-4 flex flex-col justify-between ${
        expanded
          ? "border-blue-500 bg-blue-50/10 shadow-sm"
          : "border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${rankColor}`}>
              {prize.rank}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 tracking-tight tabular-nums">
            {prize.value}
          </div>
        </div>
        <div
          className={`p-1.5 rounded-lg border bg-white text-gray-400 transition-all duration-300 flex items-center justify-center ${
            expanded
              ? "rotate-180 border-blue-200 text-blue-500 shadow-sm"
              : "border-gray-100 group-hover:border-gray-200"
          }`}
        >
          <KeyboardArrowDownIcon style={{ fontSize: 14 }} />
        </div>
      </div>

      <PrizeAwards />

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? "max-h-32 opacity-100 mt-2.5" : "max-h-0 opacity-0"
        }`}
      >
        <PrizePerks isChampion={isChampion} />
      </div>
    </div>
  );
};

// ─── PrizeRowFull (no accordion, dùng trong modal) ────────────────────────────
const PrizeRowFull = ({ prize }: { prize: Prize }) => {
  const { dotColor, rankColor, isChampion } = getRankColors(prize.rank);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-4 flex flex-col gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${rankColor}`}>
            {prize.rank}
          </span>
        </div>
        <div className="text-lg font-bold text-gray-900 tracking-tight tabular-nums">
          {prize.value}
        </div>
      </div>
      <PrizeAwards />
      <PrizePerks isChampion={isChampion} />
    </div>
  );
};

// ─── EventPrizesCard ──────────────────────────────────────────────────────────
interface EventPrizesCardProps {
  prizes: Event["prizes"];
}

export const EventPrizesCard = ({ prizes }: EventPrizesCardProps) => {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [showAllModal, setShowAllModal]   = useState(false);

  useBodyScrollLock(showAllModal);

  if (prizes.length === 0) return null;

  const previewPrizes = prizes.slice(0, PRIZE_MAX_PREVIEW);
  const hasMore       = prizes.length > PRIZE_MAX_PREVIEW;
  const toggle        = (rank: string) =>
    setExpandedRank((prev) => (prev === rank ? null : rank));

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-2 tracking-widest">
            <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />
            Prize Structure
          </h3>
          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full font-bold tabular-nums">
            {prizes.length}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {previewPrizes.map((prize) => (
            <PrizeRow
              key={prize.rank}
              prize={prize}
              expanded={expandedRank === prize.rank}
              onToggle={() => toggle(prize.rank)}
            />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAllModal(true)}
            className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors group"
          >
            View all {prizes.length} prizes
            <ChevronRightIcon
              style={{ fontSize: 14 }}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        )}
      </section>

      {showAllModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <EmojiEventsIcon className="text-blue-500" />
                <h3 className="text-base font-bold text-gray-900">All Prizes</h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {prizes.map((prize) => (
                <PrizeRowFull key={prize.rank} prize={prize} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};