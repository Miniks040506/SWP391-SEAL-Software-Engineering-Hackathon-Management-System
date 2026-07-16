import { useMutation, useQueryClient } from "@tanstack/react-query";

import { criteriaApi } from "@/api/criteria.api";
import { eventAssetApi } from "@/api/eventAsset.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";

import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import { coordinatorEventKeys } from "@/features/coordinator/hooks/useCoordinatorEventQueries";

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
    competitionStartAt: toLocalDateTime(values.competitionStartAt),
    competitionEndAt: toLocalDateTime(values.competitionEndAt),
    varianceThresholdPoints: values.varianceThresholdPoints,
    bannerUrl,
    status: "DRAFT",
  });
  const trackIds = new Map<string, string>();
  const roundIds = new Map<string, string>();

  for (const track of values.tracks) {
    const created = await trackApi.createTrack(createdEvent.id, {
      name: track.trackName.trim(),
      description: nullIfBlank(track.description),
      maxTeams: numberOrUndefined(track.maxTeams),
      requiredLinkTypes: track.requiredLinkTypes,
    });
    trackIds.set(track.id, created.id);
  }

  for (const prize of values.prizes) {
    await prizeApi.createPrize({
      eventId: createdEvent.id,
      trackId: prize.trackId ? trackIds.get(prize.trackId) : undefined,
      rankPosition: numberOrUndefined(prize.rankPosition),
      title: prize.title.trim(),
      description: nullIfBlank(prize.description),
      value: numberOrUndefined(prize.value),
      currency: nullIfBlank(prize.currency),
      sponsorName: nullIfBlank(prize.sponsorName),
    });
  }

  for (const [index, round] of values.rounds.entries()) {
    const created = await roundApi.createRound(createdEvent.id, {
      name: round.roundName.trim(),
      description: nullIfBlank(round.description),
      orderIndex: index + 1,
      isFinal: index === values.rounds.length - 1,
      startAt: toLocalDateTime(round.startAt),
      endAt: toLocalDateTime(round.endAt),
      submissionDeadline: toLocalDateTime(round.submissionDeadline),
      judgingDeadline: toLocalDateTime(round.judgingDeadline),
    });
    roundIds.set(round.id, created.id);
  }

  for (const round of values.rounds) {
    const roundId = roundIds.get(round.id);
    if (!roundId) throw new Error("Created round mapping is missing.");
    for (const rule of round.advanceRules) {
      await roundApi.createAdvanceRule(roundId, {
        ...rule,
        trackId: rule.trackId ? trackIds.get(rule.trackId) : undefined,
      });
    }
  }

  for (const criteria of values.criteria) {
    const appliesToRoundIds = criteria.appliesToRoundLocalIds
      .map((roundId) => roundIds.get(roundId))
      .filter((id): id is string => Boolean(id));
    await criteriaApi.createEventCriteria(createdEvent.id, {
      criteriaId:
        criteria.sourceType === "TEMPLATE" ? criteria.criteriaId || null : null,
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
      appliesToRoundIds:
        appliesToRoundIds.length > 0 ? appliesToRoundIds : null,
      displayOrder: numberOrUndefined(criteria.displayOrder),
    });
  }

  for (const assignment of values.mentorJudgeAssignments) {
    if (assignment.role === "MENTOR") {
      for (const localTrackId of assignment.assignedTrackIds) {
        const trackId = trackIds.get(localTrackId);
        if (!trackId) throw new Error("Assigned track mapping is missing.");
        await trackApi.assignMentor(trackId, {
          mentorUserId: assignment.userId,
        });
      }
    } else {
      for (const pair of assignment.judgeRoundAssignments) {
        const trackId = trackIds.get(pair.trackId);
        const roundId = roundIds.get(pair.roundId);
        if (!trackId || !roundId) {
          throw new Error("Judge track-round mapping is missing.");
        }
        await roundApi.assignJudge(roundId, {
          judgeId: assignment.judgeId || assignment.userId,
          trackId,
          totalToScore: numberOrUndefined(pair.totalToScore),
        });
      }
    }
  }

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventFlow,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: coordinatorEventKeys.all,
      });
    },
  });
}
