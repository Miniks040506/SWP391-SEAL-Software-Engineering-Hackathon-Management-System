import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { criteriaApi } from "@/api/criteria.api";
import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";

export function useCreateEventCriteriaStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const rounds = useWatch({ control, name: "rounds" }) ?? [];
  const criteria = useWatch({ control, name: "criteria" }) ?? [];

  const templatesQuery = useQuery({
    queryKey: ["scoring-criteria", "create-event-step", "active"],
    queryFn: () =>
      criteriaApi.getScoringCriteria({
        isActive: true,
        page: 0,
        size: 100,
      }),
  });

  const fieldArray = useFieldArray({
    control,
    name: "criteria",
    keyName: "fieldId",
  });

  return {
    errors,
    rounds,
    criteria,
    templatesQuery,
    templateOptions: templatesQuery.data?.content ?? [],
    ...fieldArray,
  };
}
