import { z } from "zod";

import type {
  CreateEventCriteriaRequest,
  EventCriteriaFormValues,
  EventCriteriaResponse,
  UpdateEventCriteriaRequest,
} from "@/types/criteria.types";

const optionalPositiveNumberString = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => !value || Number.isFinite(Number(value)), `${label} must be a number.`)
    .refine((value) => !value || Number(value) > 0, `${label} must be greater than 0.`);

const optionalPositiveIntegerString = (label: string) =>
  optionalPositiveNumberString(label).refine(
    (value) => !value || Number.isInteger(Number(value)),
    `${label} must be an integer.`,
  );

export const eventCriteriaFormSchema = z
  .object({
    mode: z.enum(["TEMPLATE", "CUSTOM"]).default("TEMPLATE"),
    criteriaId: z.string().trim().optional().default(""),
    nameOverride: z
      .string()
      .trim()
      .max(200, "Criteria name must not exceed 200 characters.")
      .optional()
      .default(""),
    descriptionOverride: z.string().trim().optional().default(""),
    rubricOverride: z.string().trim().optional().default(""),
    weightOverride: optionalPositiveNumberString("Weight"),
    maxScoreOverride: optionalPositiveNumberString("Max score"),
    isTechnicalOverride: z.boolean().default(true),
    appliesToRoundIds: z.array(z.string()).default([]),
    displayOrder: optionalPositiveIntegerString("Display order"),
    isActive: z.boolean().default(true),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "CUSTOM" && !values.nameOverride) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nameOverride"],
        message: "Custom event criteria name is required.",
      });
    }
  });

export type ParsedEventCriteriaFormValues = z.infer<typeof eventCriteriaFormSchema>;

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

const nullIfBlank = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const numberOrUndefined = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toEventCriteriaFormValues = (
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

export const parseEventCriteriaForm = (values: EventCriteriaFormValues) =>
  eventCriteriaFormSchema.safeParse(values);

export const getFirstEventCriteriaError = (
  values: EventCriteriaFormValues,
  options?: { isEdit?: boolean },
) => {
  const parsed = parseEventCriteriaForm(values);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid event criteria data.";
  }

  if (values.mode === "TEMPLATE" && !values.criteriaId && !options?.isEdit) {
    return "Choose a global scoring criteria template.";
  }

  return null;
};

export function toCreateEventCriteriaPayload(
  values: EventCriteriaFormValues,
): CreateEventCriteriaRequest {
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

export function toUpdateEventCriteriaPayload(
  values: EventCriteriaFormValues,
): UpdateEventCriteriaRequest {
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
