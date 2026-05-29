import type { UUID } from "@/types/common.types";

export type CreateScoringCriteriaRequest = {
  name: string;
  description?: string;
  rubric?: string;
  maxScore: number;
  defaultWeight: number;
  category: string;
  isTechnical: boolean;
  isDefault?: boolean;
};

export type UpdateScoringCriteriaRequest = {
  name?: string;
  description?: string;
  rubric?: string;
  maxScore?: number;
  defaultWeight?: number;
  category?: string;
  isTechnical?: boolean;
  isActive?: boolean;
};

export type CreateEventCriteriaRequest = {
  criteriaId?: UUID;
  nameOverride?: string;
  descriptionOverride?: string;
  rubricOverride?: string;
  weightOverride?: number;
  maxScoreOverride?: number;
  isTechnicalOverride?: boolean;
  appliesToRoundIds?: UUID[];
  displayOrder?: number;
};

export type UpdateEventCriteriaRequest = {
  nameOverride?: string;
  descriptionOverride?: string;
  rubricOverride?: string;
  weightOverride?: number;
  maxScoreOverride?: number;
  isTechnicalOverride?: boolean;
  isActive?: boolean;
  appliesToRoundIds?: UUID[];
  displayOrder?: number;
};

export type ScoringCriteriaResponse = {
  id: UUID;
  name: string;
  description?: string;
  rubric?: string;
  maxScore: number;
  defaultWeight: number;
  category: string;
  isTechnical: boolean;
  isDefault: boolean;
  isActive: boolean;
};

export type EventCriteriaResponse = {
  id: UUID;
  eventId: UUID;
  criteriaId?: UUID;
  effectiveName: string;
  effectiveDescription?: string;
  effectiveRubric?: string;
  effectiveWeight: number;
  effectiveMaxScore: number;
  effectiveIsTechnical: boolean;
  displayOrder?: number;
  isActive: boolean;
};

export type GetScoringCriteriaParams = {
  isActive?: boolean;
  isTechnical?: boolean;
  category?: string;
  page?: number;
  size?: number;
};

export type GetEventCriteriaParams = {
  isActive?: boolean;
  isTechnical?: boolean;
};
