import { useMutation } from "@tanstack/react-query";

import { criteriaApi } from "@/api/criteria.api";
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

function criteriaNumberOrNull(value: unknown) {
  const parsed = numberOrUndefined(value);
  return parsed === undefined ? null : parsed;
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

  const createdTracks = await Promise.all(
    values.tracks.map((track) => trackApi.createTrack(createdEvent.id, {
      name: track.trackName.trim(),
      description: nullIfBlank(track.description),
      maxTeams: numberOrUndefined(track.maxTeams),
      requiredLinkTypes: track.requiredLinkTypes,
    })),
  );

  createdTracks.forEach((createdTrack, index) => {
    const track = values.tracks[index];
    trackIdMap.set(track.id, createdTrack.id);
  });

  await Promise.all(values.prizes.map((prize) => {
    const mappedTrackId = prize.trackId ? trackIdMap.get(prize.trackId) : undefined;

    return prizeApi.createPrize({
      eventId: createdEvent.id,
      trackId: mappedTrackId,
      rankPosition: numberOrUndefined(prize.rankPosition),
      title: prize.title.trim(),
      description: nullIfBlank(prize.description),
      value: numberOrUndefined(prize.value),
      currency: nullIfBlank(prize.currency),
      sponsorName: nullIfBlank(prize.sponsorName),
    });
  }));

  const createdRounds = await Promise.all(
    values.rounds.map((round) => roundApi.createRound(createdEvent.id, {
      name: round.roundName.trim(),
      orderIndex: Number(round.orderIndex),
      isFinal: round.isFinal,
      submissionDeadline: toLocalDateTime(round.submissionDeadline),
      judgingDeadline: toLocalDateTime(round.judgingDeadline),
    })),
  );

  await Promise.all(createdRounds.flatMap((createdRound, index) => {
    const round = values.rounds[index];
    roundIdMap.set(round.id, createdRound.id);

    return round.advanceRules.map((rule) =>
      roundApi.createAdvanceRule(createdRound.id, {
        ...rule,
        trackId: rule.trackId ? trackIdMap.get(rule.trackId) : undefined,
      }),
    );
  }));

  await Promise.all(values.criteria.map((criteria) => {
    const appliesToRoundIds = criteria.appliesToRoundLocalIds
      .map((localRoundId) => roundIdMap.get(localRoundId))
      .filter((id): id is string => Boolean(id));

    return criteriaApi.createEventCriteria(createdEvent.id, {
      criteriaId: criteria.sourceType === "TEMPLATE" ? criteria.criteriaId || null : null,
      nameOverride:
        criteria.sourceType === "CUSTOM"
          ? (criteria.nameOverride ?? "").trim()
          : nullIfBlank(criteria.nameOverride),
      descriptionOverride: nullIfBlank(criteria.descriptionOverride),
      rubricOverride: nullIfBlank(criteria.rubricOverride),
      weightOverride: criteriaNumberOrNull(criteria.weightOverride),
      maxScoreOverride: criteriaNumberOrNull(criteria.maxScoreOverride),
      isTechnicalOverride:
        criteria.sourceType === "CUSTOM" ? criteria.isTechnicalOverride : null,
      appliesToRoundIds: appliesToRoundIds.length > 0 ? appliesToRoundIds : null,
      displayOrder: numberOrUndefined(criteria.displayOrder),
    });
  }));

  await Promise.all(values.mentorJudgeAssignments.flatMap((assignment) => {
    if (assignment.role === "MENTOR") {
      return assignment.assignedTrackIds.map((localTrackId) => {
        const mappedTrackId = trackIdMap.get(localTrackId);
        if (!mappedTrackId) return Promise.resolve();

        return trackApi.assignMentor(mappedTrackId, {
          mentorUserId: assignment.userId,
        });
      });
    }

    if (assignment.role === "JUDGE") {
      const judgeId = assignment.judgeId || assignment.userId;

      return assignment.judgeRoundAssignments.map((pair) => {
        const mappedTrackId = trackIdMap.get(pair.trackId);
        const mappedRoundId = roundIdMap.get(pair.roundId);

        if (!mappedTrackId || !mappedRoundId) return Promise.resolve();

        return roundApi.assignJudge(mappedRoundId, {
          judgeId,
          trackId: mappedTrackId,
          totalToScore: numberOrUndefined(pair.totalToScore),
        });
      });
    }

    return [];
  }));

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  return useMutation({
    mutationFn: createEventFlow,
  });
}
