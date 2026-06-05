import type { AxiosError } from "axios";
import type {
  BooleanFilterValue,
  CriteriaFormValues,
  EventCriteriaFormValues,
  EventCriteriaResponse,
  ScoringCriteriaResponse,
} from "@/types/criteria.types";
import type { UUID } from "@/types/common.types";

export const booleanFilterToParam = (value: BooleanFilterValue) => {
  if (value === "TRUE") return true;
  if (value === "FALSE") return false;
  return undefined;
};

export const numberOrUndefined = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const nullIfBlank = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const getCriteriaErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
};

export const defaultCriteriaFormValues: CriteriaFormValues = {
  name: "",
  description: "",
  rubric: "",
  maxScore: "10",
  defaultWeight: "1",
  category: "TECHNICAL",
  isTechnical: true,
  isDefault: true,
  isActive: true,
};

export const createCriteriaFormValues = (
  criteria?: ScoringCriteriaResponse | null,
): CriteriaFormValues => {
  if (!criteria) return { ...defaultCriteriaFormValues };

  return {
    name: criteria.name ?? "",
    description: criteria.description ?? "",
    rubric: criteria.rubric ?? "",
    maxScore: String(criteria.maxScore ?? 10),
    defaultWeight: String(criteria.defaultWeight ?? 1),
    category: criteria.category as CriteriaFormValues["category"],
    isTechnical: Boolean(criteria.isTechnical),
    isDefault: Boolean(criteria.isDefault),
    isActive: Boolean(criteria.isActive),
  };
};

export const defaultEventCriteriaFormValues: EventCriteriaFormValues = {
  mode: "TEMPLATE",
  criteriaId: "",
  nameOverride: "",
  descriptionOverride: "",
  rubricOverride: "",
  weightOverride: "",
  maxScoreOverride: "",
  isTechnicalOverride: true,
  appliesToRoundIds: [],
  displayOrder: "",
  isActive: true,
};

export const createEventCriteriaFormValues = (
  criteria?: EventCriteriaResponse | null,
): EventCriteriaFormValues => {
  if (!criteria) return { ...defaultEventCriteriaFormValues };

  return {
    mode: criteria.isCustom ? "CUSTOM" : "TEMPLATE",
    criteriaId: criteria.criteriaId ?? "",
    nameOverride: criteria.nameOverride ?? "",
    descriptionOverride: criteria.descriptionOverride ?? "",
    rubricOverride: criteria.rubricOverride ?? "",
    weightOverride:
      criteria.weightOverride === null || criteria.weightOverride === undefined
        ? ""
        : String(criteria.weightOverride),
    maxScoreOverride:
      criteria.maxScoreOverride === null || criteria.maxScoreOverride === undefined
        ? ""
        : String(criteria.maxScoreOverride),
    isTechnicalOverride: Boolean(
      criteria.isTechnicalOverride ?? criteria.effectiveIsTechnical,
    ),
    appliesToRoundIds: criteria.appliesToRoundIds ?? [],
    displayOrder:
      criteria.displayOrder === null || criteria.displayOrder === undefined
        ? ""
        : String(criteria.displayOrder),
    isActive: Boolean(criteria.isActive),
  };
};

export const roundScopeText = (
  appliesToRoundIds?: UUID[] | null,
  roundNameById?: Map<UUID, string>,
) => {
  if (!appliesToRoundIds || appliesToRoundIds.length === 0) {
    return "All rounds";
  }

  if (!roundNameById) {
    return `${appliesToRoundIds.length} selected round(s)`;
  }

  return appliesToRoundIds
    .map((id) => roundNameById.get(id) ?? id)
    .join(", ");
};
