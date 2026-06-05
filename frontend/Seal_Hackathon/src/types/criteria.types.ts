import type { PageResponse, UUID } from "@/types/common.types";

export const CRITERIA_CATEGORIES = [
  "TECHNICAL",
  "PRESENTATION",
  "INNOVATION",
  "BUSINESS",
  "PROCESS",
] as const;

export type CriteriaCategory = (typeof CRITERIA_CATEGORIES)[number];
export type CriteriaFilterValue = "ALL" | CriteriaCategory;
export type BooleanFilterValue = "ALL" | "TRUE" | "FALSE";

export type CreateScoringCriteriaRequest = {
  name: string;
  description?: string | null;
  rubric?: string | null;
  maxScore: number;
  defaultWeight: number;
  category: CriteriaCategory | string;
  isTechnical?: boolean | null;
  isDefault?: boolean | null;
};

export type UpdateScoringCriteriaRequest = {
  name?: string;
  description?: string | null;
  rubric?: string | null;
  maxScore?: number;
  defaultWeight?: number;
  category?: CriteriaCategory | string;
  isTechnical?: boolean | null;
  isDefault?: boolean | null;
  isActive?: boolean | null;
};

export type CreateEventCriteriaRequest = {
  criteriaId?: UUID | null;
  nameOverride?: string | null;
  descriptionOverride?: string | null;
  rubricOverride?: string | null;
  weightOverride?: number | null;
  maxScoreOverride?: number | null;
  isTechnicalOverride?: boolean | null;
  appliesToRoundIds?: UUID[] | null;
  displayOrder?: number | null;
};

export type UpdateEventCriteriaRequest = {
  nameOverride?: string | null;
  descriptionOverride?: string | null;
  rubricOverride?: string | null;
  weightOverride?: number | null;
  maxScoreOverride?: number | null;
  isTechnicalOverride?: boolean | null;
  isActive?: boolean | null;
  appliesToRoundIds?: UUID[] | null;
  displayOrder?: number | null;
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
  category?: CriteriaCategory | string;
  page?: number;
  size?: number;
};

export type GetEventCriteriaParams = {
  isActive?: boolean;
  isTechnical?: boolean;
};

export type ScoringCriteriaPageResponse = PageResponse<ScoringCriteriaResponse>;

export type CriteriaFormValues = {
  name: string;
  description: string;
  rubric: string;
  maxScore: string;
  defaultWeight: string;
  category: CriteriaCategory;
  isTechnical: boolean;
  isDefault: boolean;
  isActive: boolean;
};

export type EventCriteriaFormMode = "TEMPLATE" | "CUSTOM";

export type EventCriteriaFormValues = {
  mode: EventCriteriaFormMode;
  criteriaId: UUID | "";
  nameOverride: string;
  descriptionOverride: string;
  rubricOverride: string;
  weightOverride: string;
  maxScoreOverride: string;
  isTechnicalOverride: boolean;
  appliesToRoundIds: UUID[];
  displayOrder: string;
  isActive: boolean;
};
