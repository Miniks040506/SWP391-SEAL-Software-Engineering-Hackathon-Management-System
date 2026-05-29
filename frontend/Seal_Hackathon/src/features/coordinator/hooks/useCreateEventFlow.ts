import { useMutation } from "@tanstack/react-query";

import { eventApi } from "@/api/event.api";
import { trackApi } from "@/api/track.api";
import { roundApi } from "@/api/round.api";

import type { CreateEventRequest } from "@/types/event.types";
import type { CreateTrackRequest } from "@/types/track.types";
import type {
  CreateAdvanceRuleRequest,
  CreateRoundRequest,
} from "@/types/round.types";

import type { CreateEventPayload } from "../schemas/createEvent.schema";

const toIsoDateTime = (value: string, fallbackTime = "00:00:00") => {
  if (!value) return undefined;

  const hasTime = value.includes("T");
  const dateValue = hasTime ? value : `${value}T${fallbackTime}`;

  return new Date(dateValue).toISOString();
};

const getEventYear = (date: string) => {
  if (!date) return new Date().getFullYear();

  return new Date(date).getFullYear();
};

const mapEventPayload = (values: CreateEventPayload): CreateEventRequest => {
  return {
    name: values.eventName,
    description: values.description || undefined,
    season: values.season,
    year: getEventYear(values.competitionStartDate),
    registrationStartAt: toIsoDateTime(values.registrationOpen, "00:00:00"),
    registrationEndAt: toIsoDateTime(values.registrationClose, "23:59:59"),
    bannerUrl: undefined,
    status: "DRAFT",
  };
};

const mapTrackPayload = (
  track: CreateEventPayload["tracks"][number],
): CreateTrackRequest => {
  return {
    name: track.trackName,
    description: track.description || undefined,
  };
};

const mapRoundPayload = (
  round: CreateEventPayload["tracks"][number]["rounds"][number],
  orderIndex: number,
  isFinal: boolean,
): CreateRoundRequest => {
  return {
    name: round.roundName,
    orderIndex,
    isFinal,
    submissionDeadline: toIsoDateTime(round.submissionDeadline),
    judgingDeadline: toIsoDateTime(round.judgingDeadline),
  };
};

const mapAdvanceRulePayload = (
  round: CreateEventPayload["tracks"][number]["rounds"][number],
  trackId: string,
): CreateAdvanceRuleRequest => {
  const numericValue = Number(round.advancementRuleValue);

  if (round.advancementRuleType === "Top-N Teams") {
    return {
      ruleType: "TOP_N",
      trackId,
      topN: Number.isNaN(numericValue) ? undefined : numericValue,
      description: "Advance top N teams for this track.",
    };
  }

  if (round.advancementRuleType === "Threshold Score") {
    return {
      ruleType: "MIN_SCORE",
      trackId,
      minScore: Number.isNaN(numericValue) ? undefined : numericValue,
      description: "Advance teams that reach the minimum score.",
    };
  }

  return {
    ruleType: "MANUAL",
    trackId,
    description: "Manual advancement selection.",
  };
};

async function createEventFlow(values: CreateEventPayload) {
  const createdEvent = await eventApi.createEvent(mapEventPayload(values));

  let globalRoundOrderIndex = 1;

  for (const track of values.tracks) {
    const createdTrack = await trackApi.createTrack(
      createdEvent.id,
      mapTrackPayload(track),
    );

    for (const [roundIndex, round] of track.rounds.entries()) {
      const isFinalRoundOfTrack = roundIndex === track.rounds.length - 1;

      const createdRound = await roundApi.createRound(
        createdEvent.id,
        mapRoundPayload(round, globalRoundOrderIndex, isFinalRoundOfTrack),
      );

      await roundApi.createAdvanceRule(
        createdRound.id,
        mapAdvanceRulePayload(round, createdTrack.id),
      );

      globalRoundOrderIndex += 1;
    }
  }

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  return useMutation({
    mutationFn: createEventFlow,
  });
}