import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { criteriaApi } from "@/api/criteria.api";
import { eventAssetApi } from "@/api/eventAsset.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";

import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import { coordinatorEventKeys } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import type { EventDetailResponse } from "@/types/event.types";

export type CreateEventSetupStage =
  | "event"
  | "tracks"
  | "prizes"
  | "rounds"
  | "advance rules"
  | "criteria"
  | "assignments";

export class CreateEventSetupError extends Error {
  readonly stage: CreateEventSetupStage;
  readonly event: EventDetailResponse;
  readonly cause: unknown;

  constructor(
    stage: CreateEventSetupStage,
    event: EventDetailResponse,
    cause: unknown,
  ) {
    super(`Event created, but setup failed while creating ${stage}.`);
    this.name = "CreateEventSetupError";
    this.stage = stage;
    this.event = event;
    this.cause = cause;
  }
}

type CreateEventProgress = {
  stage: CreateEventSetupStage;
  event?: EventDetailResponse;
  bannerUrl?: string;
  trackIds: Map<string, string>;
  roundIds: Map<string, string>;
  prizeIds: Set<string>;
  advanceRuleIds: Set<string>;
  criteriaIds: Set<string>;
  assignmentIds: Set<string>;
};

function createEmptyProgress(): CreateEventProgress {
  return {
    stage: "event",
    trackIds: new Map(),
    roundIds: new Map(),
    prizeIds: new Set(),
    advanceRuleIds: new Set(),
    criteriaIds: new Set(),
    assignmentIds: new Set(),
  };
}

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

async function createEventFlow(
  values: CreateEventFormValues,
  progress: CreateEventProgress,
) {
  progress.stage = "event";
  if (!progress.event) {
    if (values.bannerFile && !progress.bannerUrl) {
      const uploaded = await eventAssetApi.uploadEventBanner(values.bannerFile);
      progress.bannerUrl = uploaded.url;
    }

    progress.event = await eventApi.createEvent({
      name: values.eventName.trim(),
      description: nullIfBlank(values.description),
      season: values.season,
      year: Number(values.year),
      registrationStartAt: toLocalDateTime(values.registrationStartAt),
      registrationEndAt: toLocalDateTime(values.registrationEndAt),
      competitionStartAt: toLocalDateTime(values.competitionStartAt),
      competitionEndAt: toLocalDateTime(values.competitionEndAt),
      varianceThresholdPoints: values.varianceThresholdPoints,
      bannerUrl: progress.bannerUrl,
      status: "DRAFT",
    });
  }

  const createdEvent = progress.event;

  progress.stage = "tracks";
  for (const track of values.tracks) {
    if (progress.trackIds.has(track.id)) continue;
    const created = await trackApi.createTrack(createdEvent.id, {
      name: track.trackName.trim(),
      description: nullIfBlank(track.description),
      maxTeams: numberOrUndefined(track.maxTeams),
      requiredLinkTypes: track.requiredLinkTypes,
    });
    progress.trackIds.set(track.id, created.id);
  }

  progress.stage = "prizes";
  for (const prize of values.prizes) {
    if (progress.prizeIds.has(prize.id)) continue;
    await prizeApi.createPrize({
      eventId: createdEvent.id,
      trackId: prize.trackId ? progress.trackIds.get(prize.trackId) : undefined,
      rankPosition: numberOrUndefined(prize.rankPosition),
      title: prize.title.trim(),
      description: nullIfBlank(prize.description),
      value: numberOrUndefined(prize.value),
      currency: nullIfBlank(prize.currency),
      sponsorName: nullIfBlank(prize.sponsorName),
    });
    progress.prizeIds.add(prize.id);
  }

  progress.stage = "rounds";
  for (const [index, round] of values.rounds.entries()) {
    if (progress.roundIds.has(round.id)) continue;
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
    progress.roundIds.set(round.id, created.id);
  }

  progress.stage = "advance rules";
  for (const round of values.rounds) {
    const roundId = progress.roundIds.get(round.id);
    if (!roundId) throw new Error("Created round mapping is missing.");
    for (const [index, rule] of round.advanceRules.entries()) {
      const progressId = `${round.id}:${index}`;
      if (progress.advanceRuleIds.has(progressId)) continue;
      await roundApi.createAdvanceRule(roundId, {
        ...rule,
        trackId: rule.trackId ? progress.trackIds.get(rule.trackId) : undefined,
      });
      progress.advanceRuleIds.add(progressId);
    }
  }

  progress.stage = "criteria";
  for (const criteria of values.criteria) {
    if (progress.criteriaIds.has(criteria.id)) continue;
    const appliesToRoundIds = criteria.appliesToRoundLocalIds
      .map((roundId) => progress.roundIds.get(roundId))
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
    progress.criteriaIds.add(criteria.id);
  }

  progress.stage = "assignments";
  for (const assignment of values.mentorJudgeAssignments) {
    if (assignment.role === "MENTOR") {
      for (const localTrackId of assignment.assignedTrackIds) {
        const progressId = `${assignment.id}:${localTrackId}`;
        if (progress.assignmentIds.has(progressId)) continue;
        const trackId = progress.trackIds.get(localTrackId);
        if (!trackId) throw new Error("Assigned track mapping is missing.");
        await trackApi.assignMentor(trackId, {
          mentorUserId: assignment.userId,
        });
        progress.assignmentIds.add(progressId);
      }
    } else {
      for (const pair of assignment.judgeRoundAssignments) {
        const progressId = `${assignment.id}:${pair.id}`;
        if (progress.assignmentIds.has(progressId)) continue;
        const trackId = progress.trackIds.get(pair.trackId);
        const roundId = progress.roundIds.get(pair.roundId);
        if (!trackId || !roundId) {
          throw new Error("Judge track-round mapping is missing.");
        }
        await roundApi.assignJudge(roundId, {
          judgeId: assignment.judgeId || assignment.userId,
          trackId,
          totalToScore: numberOrUndefined(pair.totalToScore),
        });
        progress.assignmentIds.add(progressId);
      }
    }
  }

  return createdEvent;
}

export function useCreateEventFlowMutation() {
  const queryClient = useQueryClient();
  const progressRef = useRef<CreateEventProgress>(createEmptyProgress());

  return useMutation({
    mutationFn: async (values: CreateEventFormValues) => {
      const progress = progressRef.current;
      try {
        return await createEventFlow(values, progress);
      } catch (error) {
        if (progress.event) {
          throw new CreateEventSetupError(
            progress.stage,
            progress.event,
            error,
          );
        }
        throw error;
      }
    },
    onSuccess: async () => {
      progressRef.current = createEmptyProgress();
      await queryClient.invalidateQueries({
        queryKey: coordinatorEventKeys.all,
      });
    },
  });
}
