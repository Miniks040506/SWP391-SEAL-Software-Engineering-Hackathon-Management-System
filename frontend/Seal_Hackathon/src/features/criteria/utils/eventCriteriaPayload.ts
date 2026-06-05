import {
  nullIfBlank,
  numberOrUndefined,
} from "@/features/criteria/utils/criteriaView";
import type { EventCriteriaFormValues } from "@/types/criteria.types";

export function toCreateEventCriteriaPayload(values: EventCriteriaFormValues) {
  const isTemplate = values.mode === "TEMPLATE";

  return {
    criteriaId: isTemplate ? values.criteriaId || null : null,
    nameOverride: isTemplate
      ? nullIfBlank(values.nameOverride)
      : values.nameOverride.trim(),
    descriptionOverride: nullIfBlank(values.descriptionOverride),
    rubricOverride: nullIfBlank(values.rubricOverride),
    weightOverride: numberOrUndefined(values.weightOverride),
    maxScoreOverride: numberOrUndefined(values.maxScoreOverride),
    isTechnicalOverride: isTemplate ? null : values.isTechnicalOverride,
    appliesToRoundIds:
      values.appliesToRoundIds.length > 0 ? values.appliesToRoundIds : null,
    displayOrder: numberOrUndefined(values.displayOrder),
  };
}

export function toUpdateEventCriteriaPayload(values: EventCriteriaFormValues) {
  return {
    nameOverride: nullIfBlank(values.nameOverride),
    descriptionOverride: nullIfBlank(values.descriptionOverride),
    rubricOverride: nullIfBlank(values.rubricOverride),
    weightOverride: numberOrUndefined(values.weightOverride),
    maxScoreOverride: numberOrUndefined(values.maxScoreOverride),
    isTechnicalOverride:
      values.mode === "CUSTOM" || values.isTechnicalOverride !== undefined
        ? values.isTechnicalOverride
        : null,
    isActive: values.isActive,
    appliesToRoundIds:
      values.appliesToRoundIds.length > 0 ? values.appliesToRoundIds : null,
    displayOrder: numberOrUndefined(values.displayOrder),
  };
}
