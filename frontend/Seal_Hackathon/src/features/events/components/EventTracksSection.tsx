import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { ProgressTimeline } from "@/features/events/components/ProgressTimeline";
import {
  buildRoundTimelineSteps,
  getCurrentPhase,
  isCompletedEvent,
} from "@/features/events/utils/publicEventView";
import type { EventDetailResponse } from "@/types/event.types";
import type { RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

type TrackAccordionProps = {
  track: TrackResponse;
  rounds: RoundResponse[];
  eventStatus?: string;
};

function TrackAccordion({ track, rounds, eventStatus }: TrackAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = buildRoundTimelineSteps(rounds);
  const currentPhase = getCurrentPhase(rounds, eventStatus);
  const ended = isCompletedEvent(eventStatus);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-300 hover:border-blue-300 hover:shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between bg-white p-5 text-left transition-colors hover:bg-gray-50/50"
      >
        <div className="space-y-1 pr-4">
          <span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
            Track
          </span>

          <h4 className="mt-1 text-sm font-bold text-gray-900 md:text-base">
            {track.name}
          </h4>

          {track.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
              {track.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 shadow-sm">
          <div
            className={[
              "flex items-center justify-center transition-transform duration-300",
              isOpen ? "rotate-180 text-blue-500" : "",
            ].join(" ")}
          >
            <KeyboardArrowDownIcon style={{ fontSize: 20 }} />
          </div>
        </div>
      </button>

      <div
        className={[
          "overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 ease-in-out",
          isOpen ? "max-h-300 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="bg-gray-50/30 p-6">
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
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900">
          <MenuBookIcon style={{ fontSize: 16 }} className="text-blue-500" />
          Competitive Tracks & Rounds
        </h2>

        <p className="text-xs text-gray-400">
          Expand a track below to see structured execution milestones and timeline rounds.
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm font-semibold text-gray-400">
          No tracks have been published yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tracks.map((track) => (
            <TrackAccordion
              key={track.id}
              track={track}
              rounds={rounds}
              eventStatus={event.status}
            />
          ))}
        </div>
      )}
    </section>
  );
}