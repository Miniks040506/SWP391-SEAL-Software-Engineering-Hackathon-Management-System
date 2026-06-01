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

const toLocalDateTime = (value?: string) => {
  if (!value) return undefined;

  return value.length === 16 ? `${value}:00` : value;
};

const mapEventPayload = (values: CreateEventPayload): CreateEventRequest => {
  return {
    name: values.eventName,
    description: values.description || undefined,
    season: values.season,
    year: Number(values.year),
    registrationStartAt: toLocalDateTime(values.registrationStartAt),
    registrationEndAt: toLocalDateTime(values.registrationEndAt),
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
    maxTeams: track.maxTeams ? Number(track.maxTeams) : undefined,
    requiredLinkTypes: track.requiredLinkTypes,
  };
};

const mapRoundPayload = (
  round: CreateEventPayload["tracks"][number]["rounds"][number],
): CreateRoundRequest => {
  return {
    name: round.roundName,
    orderIndex: Number(round.orderIndex),
    isFinal: round.isFinal,
    submissionDeadline: toLocalDateTime(round.submissionDeadline),
    judgingDeadline: toLocalDateTime(round.judgingDeadline),
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

  for (const track of values.tracks) {
    const createdTrack = await trackApi.createTrack(
      createdEvent.id,
      mapTrackPayload(track),
    );

    for (const round of track.rounds) {
      const createdRound = await roundApi.createRound(
        createdEvent.id,
        mapRoundPayload(round),
      );

      await roundApi.createAdvanceRule(
        createdRound.id,
        mapAdvanceRulePayload(round, createdTrack.id),
      );
    }
  }

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  return useMutation({
    mutationFn: createEventFlow,
  });
}