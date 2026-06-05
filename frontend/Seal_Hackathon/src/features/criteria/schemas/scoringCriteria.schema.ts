import { z } from "zod";

import {
  CRITERIA_CATEGORIES,
  type CriteriaFormValues,
  type CreateScoringCriteriaRequest,
  type ScoringCriteriaResponse,
  type UpdateScoringCriteriaRequest,
} from "@/types/criteria.types";

const requiredPositiveNumberString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number.`)
    .refine((value) => Number(value) > 0, `${label} must be greater than 0.`);

const requiredNonNegativeNumberString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number.`)
    .refine(
      (value) => Number(value) >= 0,
      `${label} must be greater than or equal to 0.`,
    );

export const scoringCriteriaFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Criteria name is required.")
    .max(200, "Criteria name must not exceed 200 characters."),
  description: z.string().trim().optional().default(""),
  rubric: z.string().trim().optional().default(""),
  maxScore: requiredPositiveNumberString("Max score"),
  defaultWeight: requiredNonNegativeNumberString("Default weight"),
  category: z.enum(CRITERIA_CATEGORIES),
  isTechnical: z.boolean().default(true),
  isDefault: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type ScoringCriteriaFormValues = z.infer<typeof scoringCriteriaFormSchema>;

export const defaultScoringCriteriaFormValues: CriteriaFormValues = {
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

const nullIfBlank = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const toScoringCriteriaFormValues = (
  criteria?: ScoringCriteriaResponse | null,
): CriteriaFormValues => {
  if (!criteria) return { ...defaultScoringCriteriaFormValues };

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

export const parseScoringCriteriaForm = (values: CriteriaFormValues) =>
  scoringCriteriaFormSchema.safeParse(values);

export const toCreateScoringCriteriaPayload = (
  values: CriteriaFormValues,
): CreateScoringCriteriaRequest => ({
  name: values.name.trim(),
  description: nullIfBlank(values.description),
  rubric: nullIfBlank(values.rubric),
  maxScore: Number(values.maxScore),
  defaultWeight: Number(values.defaultWeight),
  category: values.category,
  isTechnical: values.isTechnical,
  isDefault: values.isDefault,
});

export const toUpdateScoringCriteriaPayload = (
  values: CriteriaFormValues,
): UpdateScoringCriteriaRequest => ({
  name: values.name.trim(),
  description: nullIfBlank(values.description),
  rubric: nullIfBlank(values.rubric),
  maxScore: Number(values.maxScore),
  defaultWeight: Number(values.defaultWeight),
  category: values.category,
  isTechnical: values.isTechnical,
  isDefault: values.isDefault,
  isActive: values.isActive,
});

export const getFirstScoringCriteriaError = (values: CriteriaFormValues) => {
  const parsed = parseScoringCriteriaForm(values);
  if (parsed.success) return null;

  return parsed.error.issues[0]?.message ?? "Invalid scoring criteria data.";
};
