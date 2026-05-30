import { useEffect, useMemo, useRef, useState } from "react";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useBodyScrollLock } from "@/features/events/hooks/useBodyScrollLock";
import {
  groupPrizesByTrack,
  type PublicPrizeGroup,
  type PublicPrizeView,
} from "@/features/events/utils/publicEventView";
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";

const TRACK_PREVIEW_COUNT = 2;
const PRIZE_MAX_PREVIEW = 1;

function getRankColors(rank: string) {
  const key = rank.toLowerCase();
  const champion = key.includes("1") || key.includes("champion") || key.includes("first");
  const runnerUp = key.includes("2") || key.includes("runner") || key.includes("second");

  return {
    dotColor: champion ? "bg-amber-400" : runnerUp ? "bg-slate-400" : "bg-orange-400",
    rankColor: champion ? "text-amber-600" : runnerUp ? "text-slate-500" : "text-orange-600",
    isChampion: champion,
  };
}

function PrizePerks({ isChampion }: { isChampion: boolean }) {
  return (
    <div className="space-y-2.5 rounded-lg border border-gray-100 bg-white p-3 text-xs font-normal text-gray-600">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-blue-500" />
        <span>Includes official SEAL certificate and award recognition.</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-blue-500" />
        <span>Eligible for final showcase and public result publication.</span>
      </div>

      {isChampion && (
        <div className="flex items-center gap-2 pt-0.5">
          <CardGiftcardIcon style={{ fontSize: 13 }} className="text-emerald-500" />

          <span className="font-semibold text-emerald-700">
            Bonus sponsor package may be included.
          </span>
        </div>
      )}
    </div>
  );
}

function PrizeAwards() {
  return (
    <div className="flex items-center gap-4 border-t border-gray-100/80 pt-3.5 text-xs font-normal text-gray-600">
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
}

type PrizeRowProps = {
  prize: PublicPrizeView;
  expanded: boolean;
  onToggle: () => void;
};

function PrizeRow({ prize, expanded, onToggle }: PrizeRowProps) {
  const { dotColor, rankColor, isChampion } = getRankColors(prize.rank);

  return (
    <div
      onClick={onToggle}
      className={[
        "group flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-300",
        expanded
          ? "border-blue-500 bg-blue-50/10 shadow-sm"
          : "border-gray-100 bg-gray-50/30 hover:border-gray-200 hover:bg-white hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />

            <span className={`text-[10px] font-bold uppercase tracking-wider ${rankColor}`}>
              {prize.rank}
            </span>
          </div>

          <div className="text-base font-bold tracking-tight text-gray-900 tabular-nums">
            {prize.value}
          </div>
        </div>

        <div
          className={[
            "flex items-center justify-center rounded-lg border bg-white p-1 text-gray-400 transition-all duration-300",
            expanded
              ? "rotate-180 border-blue-200 text-blue-500 shadow-sm"
              : "border-gray-100 group-hover:border-gray-200",
          ].join(" ")}
        >
          <KeyboardArrowDownIcon style={{ fontSize: 14 }} />
        </div>
      </div>

      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          expanded ? "mt-4 max-h-60 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="space-y-3.5">
          <PrizeAwards />
          <PrizePerks isChampion={isChampion} />
        </div>
      </div>
    </div>
  );
}

function PrizeRowFull({ prize }: { prize: PublicPrizeView }) {
  const { dotColor, rankColor, isChampion } = getRankColors(prize.rank);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />

          <span className={`text-xs font-bold uppercase tracking-widest ${rankColor}`}>
            {prize.rank}
          </span>
        </div>

        <div className="text-2xl font-bold tracking-tight text-gray-950 tabular-nums">
          {prize.value}
        </div>

        {prize.description && (
          <p className="text-sm leading-6 text-gray-500">{prize.description}</p>
        )}
      </div>

      <PrizeAwards />
      <PrizePerks isChampion={isChampion} />
    </div>
  );
}

type EventPrizesCardProps = {
  prizes: PrizeResponse[];
  tracks: TrackResponse[];
  onViewAllPage?: () => void;
};

export function EventPrizesCard({
  prizes,
  tracks,
  onViewAllPage,
}: EventPrizesCardProps) {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useBodyScrollLock(showAllModal);

  const groups = useMemo(
    () => groupPrizesByTrack(prizes, tracks),
    [prizes, tracks],
  );

  const totalPrizes = groups.reduce((sum, group) => sum + group.prizes.length, 0);
  const previewGroups = groups.slice(0, TRACK_PREVIEW_COUNT);

  const toggle = (key: string) => {
    setExpandedRank((previous) => (previous === key ? null : key));
  };

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  useEffect(() => {
    if (!showAllModal) return;

    const timeout = window.setTimeout(handleScroll, 50);

    window.addEventListener("resize", handleScroll);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", handleScroll);
    };
  }, [showAllModal]);

  const scrollTabs = (direction: "left" | "right") => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const scrollAmount =
      direction === "left"
        ? -(element.clientWidth * 0.75)
        : element.clientWidth * 0.75;

    element.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  if (groups.length === 0) {
    return (
      <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900">
          <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />
          Prize Structure
        </h3>

        <p className="py-6 text-center text-sm italic text-gray-500">
          Prize information has not been published yet.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900">
            <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />
            Prize Structure
          </h3>

          <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-amber-600">
            {totalPrizes}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-5">
          {previewGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {group.name}
                </span>
              </div>

              {group.prizes.slice(0, PRIZE_MAX_PREVIEW).map((prize) => {
                const key = `${group.id}::${prize.id}`;

                return (
                  <PrizeRow
                    key={key}
                    prize={prize}
                    expanded={expandedRank === key}
                    onToggle={() => toggle(key)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="group flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-500 transition-colors hover:text-blue-700"
          >
            View all {groups.length} groups
            <ChevronRightIcon
              style={{ fontSize: 14 }}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>

          {onViewAllPage && (
            <button
              type="button"
              onClick={onViewAllPage}
              className="text-xs font-black text-gray-400 transition-colors hover:text-blue-500"
            >
              Open prize page
            </button>
          )}
        </div>
      </section>

      {showAllModal && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative z-20 flex items-center justify-between border-b border-gray-100 bg-white p-5">
              <div className="flex items-center gap-2.5">
                <EmojiEventsIcon className="text-blue-500" />
                <h3 className="text-lg font-bold tracking-tight text-gray-900">
                  Prize Distribution
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="relative z-10 flex w-full items-center border-b border-gray-100 bg-gray-50/50">
              {canScrollLeft && (
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 flex items-center bg-linear-to-r from-gray-50 via-gray-50 to-transparent pl-4 pr-8">
                  <button
                    type="button"
                    onClick={() => scrollTabs("left")}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-lg active:scale-95"
                  >
                    <ChevronLeftIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full snap-x snap-mandatory scroll-px-16 items-center gap-2 overflow-x-auto overflow-y-hidden scroll-smooth px-6 py-4 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
              >
                {groups.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveTrackIndex(index)}
                    className={[
                      "group flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5",
                      "text-xs font-bold uppercase tracking-wider transition-all",
                      activeTrackIndex === index
                        ? "bg-blue-100 text-blue-800 shadow-sm"
                        : "bg-transparent text-gray-500 hover:bg-gray-200/60 hover:text-gray-700",
                    ].join(" ")}
                  >
                    <span>{group.name}</span>

                    <span
                      className={[
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] tabular-nums transition-colors",
                        activeTrackIndex === index
                          ? "bg-blue-200 text-blue-900"
                          : "bg-gray-200 text-gray-500 group-hover:bg-gray-300 group-hover:text-gray-600",
                      ].join(" ")}
                    >
                      {group.prizes.length}
                    </span>
                  </button>
                ))}
              </div>

              {canScrollRight && (
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 flex items-center bg-linear-to-l from-gray-50 via-gray-50 to-transparent pl-8 pr-4">
                  <button
                    type="button"
                    onClick={() => scrollTabs("right")}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-lg active:scale-95"
                  >
                    <ChevronRightIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
              <div className="space-y-4">
                {(groups[activeTrackIndex] as PublicPrizeGroup | undefined)?.prizes.map(
                  (prize) => (
                    <PrizeRowFull key={prize.id} prize={prize} />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
