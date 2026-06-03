import { useMutation } from "@tanstack/react-query";

import { eventAssetApi } from "@/api/eventAsset.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";

import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";

function toLocalDateTime(value?: string | null) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

function nullIfBlank(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function numberOrUndefined(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? undefined : numberValue;
}

function mapAdvanceRule(
  round: CreateEventFormValues["rounds"][number],
  trackId: string,
) {
  const numericValue = numberOrUndefined(round.advancementRuleValue);

  if (round.advancementRuleType === "Top-N Teams") {
    return {
      ruleType: "TOP_N",
      trackId,
      topN: numericValue,
      description: "Advance top N teams for this track.",
    };
  }

  if (round.advancementRuleType === "Threshold Score") {
    return {
      ruleType: "MIN_SCORE",
      trackId,
      minScore: numericValue,
      description: "Advance teams that reach the minimum score.",
    };
  }

  return {
    ruleType: "MANUAL",
    trackId,
    description: "Manual advancement selection.",
  };
}

async function createEventFlow(values: CreateEventFormValues) {
  let bannerUrl: string | undefined;

  if (values.bannerFile) {
    const uploaded = await eventAssetApi.uploadEventBanner(values.bannerFile);
    bannerUrl = uploaded.url;
  }

  const createdEvent = await eventApi.createEvent({
    name: values.eventName.trim(),
    description: nullIfBlank(values.description),
    season: values.season,
    year: Number(values.year),
    registrationStartAt: toLocalDateTime(values.registrationStartAt),
    registrationEndAt: toLocalDateTime(values.registrationEndAt),
    bannerUrl,
    status: "DRAFT",
  });

  const trackIdMap = new Map<string, string>();
  const roundIdMap = new Map<string, string>();

  for (const track of values.tracks) {
    const createdTrack = await trackApi.createTrack(createdEvent.id, {
      name: track.trackName.trim(),
      description: nullIfBlank(track.description),
      maxTeams: numberOrUndefined(track.maxTeams),
      requiredLinkTypes: track.requiredLinkTypes,
    });

    trackIdMap.set(track.id, createdTrack.id);
  }

  for (const prize of values.prizes) {
    const mappedTrackId = prize.trackId ? trackIdMap.get(prize.trackId) : undefined;

    await prizeApi.createPrize({
      eventId: createdEvent.id,
      trackId: mappedTrackId,
      rankPosition: numberOrUndefined(prize.rankPosition),
      title: prize.title.trim(),
      description: nullIfBlank(prize.description),
      value: numberOrUndefined(prize.value),
      currency: nullIfBlank(prize.currency),
      sponsorName: nullIfBlank(prize.sponsorName),
    });
  }

  for (const round of values.rounds) {
    const createdRound = await roundApi.createRound(createdEvent.id, {
      name: round.roundName.trim(),
      orderIndex: Number(round.orderIndex),
      isFinal: round.isFinal,
      submissionDeadline: toLocalDateTime(round.submissionDeadline),
      judgingDeadline: toLocalDateTime(round.judgingDeadline),
    });

    roundIdMap.set(round.id, createdRound.id);

    for (const track of values.tracks) {
      const mappedTrackId = trackIdMap.get(track.id);
      if (!mappedTrackId) continue;

      await roundApi.createAdvanceRule(
        createdRound.id,
        mapAdvanceRule(round, mappedTrackId),
      );
    }
  }

  for (const assignment of values.mentorJudgeAssignments) {
    if (assignment.role === "MENTOR") {
      for (const localTrackId of assignment.assignedTrackIds) {
        const mappedTrackId = trackIdMap.get(localTrackId);
        if (!mappedTrackId) continue;

        await trackApi.assignMentor(mappedTrackId, {
          mentorUserId: assignment.userId,
        });
      }
    }

    if (assignment.role === "JUDGE") {
      const judgeId = assignment.judgeId || assignment.userId;

      for (const pair of assignment.judgeRoundAssignments) {
        const mappedTrackId = trackIdMap.get(pair.trackId);
        const mappedRoundId = roundIdMap.get(pair.roundId);

        if (!mappedTrackId || !mappedRoundId) continue;

        await roundApi.assignJudge(mappedRoundId, {
          judgeId,
          trackId: mappedTrackId,
          totalToScore: numberOrUndefined(pair.totalToScore),
        });
      }
    }
  }

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  return useMutation({
    mutationFn: createEventFlow,
  });
}
