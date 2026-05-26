import React, { useState } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ProgressTimeline, type TimelineStep } from "./ProgressTimeline";
import type { Event, Track } from "@/types/event.types";

// ─── TrackAccordion ───────────────────────────────────────────────────────────
interface TrackAccordionProps {
  track: Track;
  currentPhase: number;
  isEnded: boolean;
}

const TrackAccordion = ({ track, currentPhase, isEnded }: TrackAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const trackRoundsSteps: TimelineStep[] = (track.rounds || []).map(
    (round: any, index: number) => ({
      label: `Round ${index + 1}`,
      title: round.name,
      duration: round.duration,
    })
  );

  return (
    <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden transition-all duration-300 hover:border-blue-300 hover:shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors bg-white hover:bg-gray-50/50"
      >
        <div className="space-y-1 pr-4">
          <span className="inline-block text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Track
          </span>
          <h4 className="font-bold text-gray-900 text-sm md:text-base mt-1">{track.name}</h4>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{track.desc}</p>
        </div>
        <div className="p-1.5 rounded-lg text-gray-400 bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <div
            className={`transition-transform duration-300 flex items-center justify-center ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          >
            <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
          </div>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out border-t border-gray-100 bg-white overflow-hidden ${
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 bg-gray-50/30">
          <ProgressTimeline
            steps={trackRoundsSteps}
            currentPhase={currentPhase}
            isEnded={isEnded}
            showCardWrapper={false}
          />
        </div>
      </div>
    </div>
  );
};

// ─── EventTracksSection ───────────────────────────────────────────────────────
interface EventTracksSectionProps {
  tracks: Event["tracks"];
  currentPhase: number;
  isEnded: boolean;
}

export const EventTracksSection = ({
  tracks,
  currentPhase,
  isEnded,
}: EventTracksSectionProps) => (
  <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm space-y-6">
    <div className="space-y-1">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />
        Competitive Tracks & Rounds
      </h2>
      <p className="text-xs text-gray-400">
        Expand a track below to see its structured execution milestones and ongoing timeline rounds.
      </p>
    </div>
    <div className="flex flex-col gap-4">
      {tracks.map((track) => (
        <TrackAccordion
          key={track.name}
          track={track}
          currentPhase={currentPhase}
          isEnded={isEnded}
        />
      ))}
    </div>
  </section>
);