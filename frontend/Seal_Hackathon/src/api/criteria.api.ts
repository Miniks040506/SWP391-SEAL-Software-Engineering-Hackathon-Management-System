import type { UUID } from "@/types/common.types";

export const CRITERIA_CATEGORIES = [
  "TECHNICAL",
  "PRESENTATION",
  "INNOVATION",
  "BUSINESS",
  "PROCESS",
] as const;

export type CriteriaCategory = (typeof CRITERIA_CATEGORIES)[number];

export type CreateScoringCriteriaRequest = {
  name: string;
  description?: string;
  rubric?: string;
  maxScore: number;
  defaultWeight: number;
  category: CriteriaCategory | string;
  isTechnical?: boolean;
  isDefault?: boolean;
};

export type UpdateScoringCriteriaRequest = {
  name?: string;
  description?: string;
  rubric?: string;
  maxScore?: number;
  defaultWeight?: number;
  category?: CriteriaCategory | string;
  isTechnical?: boolean;
  isDefault?: boolean;
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
  description?: string | null;
  rubric?: string | null;
  maxScore: number;
  defaultWeight: number;
  category: CriteriaCategory | string;
  isTechnical: boolean;
  isDefault: boolean;
  isActive: boolean;
};

export type EventCriteriaResponse = {
  id: UUID;
  eventId: UUID;
  criteriaId?: UUID | null;
  templateName?: string | null;
  templateCategory?: CriteriaCategory | string | null;
  isCustom: boolean;
  nameOverride?: string | null;
  descriptionOverride?: string | null;
  rubricOverride?: string | null;
  weightOverride?: number | null;
  maxScoreOverride?: number | null;
  isTechnicalOverride?: boolean | null;
  effectiveName: string;
  effectiveDescription?: string | null;
  effectiveRubric?: string | null;
  effectiveWeight: number;
  effectiveMaxScore: number;
  effectiveIsTechnical: boolean;
  appliesToRoundIds?: UUID[] | null;
  displayOrder?: number | null;
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
