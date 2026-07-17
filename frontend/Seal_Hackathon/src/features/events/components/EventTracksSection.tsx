import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ProgressTimeline } from "@/features/events/components/ProgressTimeline";
import {
  buildRoundTimelineSteps,
  getCurrentPhase,
  isCompletedEvent,
} from "@/features/events/utils/publicEventView";
import type { EventDetailResponse } from "@/types/event.types";
import type { RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

type TrackAccent = {
  number: string;
  numberIdle: string;
  openBorder: string;
  hoverBorder: string;
  chevronOpen: string;
  rail: string;
};

const TRACK_ACCENTS: TrackAccent[] = [
  {
    number: "text-blue-500",
    numberIdle: "text-blue-200 dark:text-blue-500/30",
    openBorder: "border-blue-300 shadow-md shadow-blue-500/10 dark:border-blue-500/50",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500/40",
    chevronOpen:
      "border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400",
    rail: "bg-linear-to-b from-blue-500 to-cyan-400",
  },
  {
    number: "text-violet-500",
    numberIdle: "text-violet-200 dark:text-violet-500/30",
    openBorder:
      "border-violet-300 shadow-md shadow-violet-500/10 dark:border-violet-500/50",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-500/40",
    chevronOpen:
      "border-violet-200 bg-violet-50 text-violet-500 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-400",
    rail: "bg-linear-to-b from-violet-500 to-indigo-400",
  },
  {
    number: "text-cyan-500",
    numberIdle: "text-cyan-200 dark:text-cyan-500/30",
    openBorder: "border-cyan-300 shadow-md shadow-cyan-500/10 dark:border-cyan-500/50",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-500/40",
    chevronOpen:
      "border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-500/40 dark:bg-cyan-500/10 dark:text-cyan-400",
    rail: "bg-linear-to-b from-cyan-400 to-sky-500",
  },
  {
    number: "text-emerald-500",
    numberIdle: "text-emerald-200 dark:text-emerald-500/30",
    openBorder:
      "border-emerald-300 shadow-md shadow-emerald-500/10 dark:border-emerald-500/50",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500/40",
    chevronOpen:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400",
    rail: "bg-linear-to-b from-emerald-400 to-teal-400",
  },
];

type TrackAccordionProps = {
  track: TrackResponse;
  index: number;
  rounds: RoundResponse[];
  eventStatus?: string;
};

function TrackAccordion({
  track,
  index,
  rounds,
  eventStatus,
}: TrackAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = buildRoundTimelineSteps(rounds);
  const currentPhase = getCurrentPhase(rounds, eventStatus);
  const ended = isCompletedEvent(eventStatus);
  const accent = TRACK_ACCENTS[index % TRACK_ACCENTS.length];

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        isOpen
          ? accent.openBorder
          : `border-gray-200 dark:border-slate-800 ${accent.hoverBorder}`,
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-y-0 left-0 w-1 transition-opacity duration-300",
          accent.rail,
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center gap-5 bg-white p-6 text-left transition-colors hover:bg-gray-50/60 dark:bg-slate-900 dark:hover:bg-slate-800/60"
      >
        <span
          className={[
            "text-3xl font-black tabular-nums leading-none transition-colors",
            isOpen ? accent.number : accent.numberIdle,
          ].join(" ")}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
            {track.name}
          </h4>

          {track.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              {track.description}
            </p>
          )}
        </div>

        <div
          className={[
            "flex shrink-0 items-center justify-center rounded-xl border p-2 transition-all duration-300",
            isOpen
              ? `rotate-180 ${accent.chevronOpen}`
              : "border-gray-200 bg-white text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500",
          ].join(" ")}
        >
          <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
        </div>
      </button>

      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-300 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="border-t border-gray-100 bg-gray-50/60 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/40">
          <ProgressTimeline
            steps={steps}
            currentPhase={currentPhase}
            isEnded={ended}
            showCardWrapper={false}
          />
        </div>
      </div>
    </div>
  );
}

type EventTracksSectionProps = {
  event: EventDetailResponse;
};

export function EventTracksSection({ event }: EventTracksSectionProps) {
  const tracks = event.tracks ?? [];
  const rounds = event.rounds ?? [];

  return (
    <section className="space-y-6">
      <div>
        <p className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent">
          Compete your way
        </p>

        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-slate-100">
          Tracks & Rounds
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Expand a track to see its round timeline and current phase.
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center text-sm font-semibold text-gray-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
          No tracks have been published yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tracks.map((track, index) => (
            <TrackAccordion
              key={track.id}
              track={track}
              index={index}
              rounds={rounds}
              eventStatus={event.status}
            />
          ))}
        </div>
      )}
    </section>
  );
}
