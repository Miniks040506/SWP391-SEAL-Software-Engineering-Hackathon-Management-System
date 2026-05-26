import React, { useState, useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import type { Event } from "@/types/event.types";

type Track = Event["tracks"][number];
type Prize = Track["prizes"][number];

const TRACK_PREVIEW_COUNT = 2;
const PRIZE_MAX_PREVIEW = 1;

const getRankColors = (rank: string) => {
  const key = rank.toLowerCase();
  const isChampion = key === "champion" || key === "first prize";
  const isRunnerUp = key === "runner up" || key === "second prize";
  return {
    dotColor:  isChampion ? "bg-amber-400"   : isRunnerUp ? "bg-slate-400"  : "bg-orange-400",
    rankColor: isChampion ? "text-amber-600" : isRunnerUp ? "text-slate-500" : "text-orange-600",
    isChampion,
  };
};

const PrizePerks = ({ isChampion }: { isChampion: boolean }) => (
  <div className="space-y-2.5 bg-white rounded-lg p-3 border border-gray-100 text-xs text-gray-600 font-normal">
    <div className="flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500" />
      <span>Includes high-tier physical structural Trophy presentation</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1 h-1 rounded-full bg-blue-500" />
      <span>Direct priority placement slot to Final Exhibition Venue</span>
    </div>
    {isChampion && (
      <div className="flex items-center gap-2 pt-0.5">
        <CardGiftcardIcon style={{ fontSize: 13 }} className="text-emerald-500" />
        <span className="text-emerald-700 font-semibold">
          Bonus: Sponsor Premium Mechanical Keyboard Kit
        </span>
      </div>
    )}
  </div>
);

const PrizeAwards = () => (
  <div className="flex items-center gap-4 text-xs text-gray-600 font-normal border-t border-gray-100/80 pt-3.5">
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
            <span className={`text-[10px] font-bold uppercase tracking-wider ${rankColor}`}>
              {prize.rank}
            </span>
          </div>
          <div className="text-base font-bold text-gray-900 tracking-tight tabular-nums">
            {prize.value}
          </div>
        </div>
        <div
          className={`p-1 rounded-lg border bg-white text-gray-400 transition-all duration-300 flex items-center justify-center ${
            expanded
              ? "rotate-180 border-blue-200 text-blue-500 shadow-sm"
              : "border-gray-100 group-hover:border-gray-200"
          }`}
        >
          <KeyboardArrowDownIcon style={{ fontSize: 14 }} />
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded ? "max-h-60 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-3.5">
            <PrizeAwards />
            <PrizePerks isChampion={isChampion} />
        </div>
      </div>
    </div>
  );
};

const PrizeRowFull = ({ prize }: { prize: Prize }) => {
  const { dotColor, rankColor, isChampion } = getRankColors(prize.rank);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col gap-4.5 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${rankColor}`}>
            {prize.rank}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-950 tracking-tight tabular-nums">
          {prize.value}
        </div>
      </div>
      <PrizeAwards />
      <PrizePerks isChampion={isChampion} />
    </div>
  );
};

interface EventPrizesCardProps {
  tracks: Event["tracks"];
}

export const EventPrizesCard = ({ tracks }: EventPrizesCardProps) => {
  const [expandedRank, setExpandedRank] = useState<string | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useBodyScrollLock(showAllModal);

  const tracksWithPrizes = tracks.filter((t) => t.prizes.length > 0);
  if (tracksWithPrizes.length === 0) return null;

  const previewTracks = tracksWithPrizes.slice(0, TRACK_PREVIEW_COUNT);
  const totalPrizes = tracksWithPrizes.reduce((sum, t) => sum + t.prizes.length, 0);

  const toggle = (key: string) =>
    setExpandedRank((prev) => (prev === key ? null : key));

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    if (showAllModal) {
      // Small timeout to ensure elements are rendered before calculating scroll
      setTimeout(handleScroll, 50);
      window.addEventListener("resize", handleScroll);
      return () => window.removeEventListener("resize", handleScroll);
    }
  }, [showAllModal]);

  const scrollTabs = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      // Scroll by 75% of the container width to ensure context is maintained
      const scrollAmount = direction === "left" ? -(clientWidth * 0.75) : (clientWidth * 0.75);
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-2 tracking-widest">
            <EmojiEventsIcon style={{ fontSize: 16 }} className="text-blue-500" />
            Prize Structure
          </h3>
          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full font-bold tabular-nums">
            {totalPrizes}
          </span>
        </div>

        <div className="flex flex-col gap-5 flex-1">
          {previewTracks.map((track) => (
            <div key={track.name} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {track.name}
                </span>
              </div>
              {track.prizes.slice(0, PRIZE_MAX_PREVIEW).map((prize) => {
                const key = `${track.name}::${prize.rank}`;
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

        <button
          onClick={() => setShowAllModal(true)}
          className="mt-6 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors group"
        >
          View all {tracksWithPrizes.length} tracks
          <ChevronRightIcon
            style={{ fontSize: 14 }}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </section>

      {showAllModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-20">
              <div className="flex items-center gap-2.5">
                <EmojiEventsIcon className="text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Prize Distribution</h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="relative flex items-center w-full border-b border-gray-100 bg-gray-50/50 z-10">
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-gray-50 via-gray-50 to-transparent pr-8 pl-4 transition-opacity animate-in fade-in pointer-events-none">
                  <button
                    onClick={() => scrollTabs("left")}
                    className="pointer-events-auto w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-95"
                  >
                    <ChevronLeftIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              )}
              
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto overflow-y-hidden py-4 px-6 gap-2 w-full items-center flex-nowrap scroll-smooth snap-x snap-mandatory scroll-pl-16 scroll-pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                  {tracksWithPrizes.map((track, index) => (
                      <button
                          key={track.name}
                          onClick={() => setActiveTrackIndex(index)}
                          className={`group snap-start flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all rounded-full ${
                              activeTrackIndex === index
                                  ? "bg-blue-100 text-blue-800 shadow-sm"
                                  : "bg-transparent text-gray-500 hover:bg-gray-200/60 hover:text-gray-700"
                          }`}
                      >
                          <span>{track.name}</span>
                          <span
                              className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums transition-colors flex-shrink-0 ${
                                  activeTrackIndex === index
                                      ? "bg-blue-200 text-blue-900"
                                      : "bg-gray-200 text-gray-500 group-hover:bg-gray-300 group-hover:text-gray-600"
                              }`}
                          >
                              {track.prizes.length}
                          </span>
                      </button>
                  ))}
              </div>

              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-8 pr-4 transition-opacity animate-in fade-in pointer-events-none">
                  <button
                    onClick={() => scrollTabs("right")}
                    className="pointer-events-auto w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-md text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-95"
                  >
                    <ChevronRightIcon style={{ fontSize: 20 }} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-4">
                    {tracksWithPrizes[activeTrackIndex].prizes.map((prize, idx) => (
                        <PrizeRowFull key={`${idx}-${prize.rank}`} prize={prize} />
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};