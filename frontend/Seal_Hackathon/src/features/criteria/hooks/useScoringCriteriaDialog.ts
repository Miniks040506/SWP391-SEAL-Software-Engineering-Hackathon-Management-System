import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { criteriaApi } from "@/api/criteria.api";
import {
  getFirstScoringCriteriaError,
  toCreateScoringCriteriaPayload,
  toScoringCriteriaFormValues,
  toUpdateScoringCriteriaPayload,
} from "@/features/criteria/schemas/scoringCriteria.schema";
import { getCriteriaErrorMessage } from "@/features/criteria/utils/criteriaView";
import type { UUID } from "@/types/common.types";
import type {
  CriteriaFormValues,
  ScoringCriteriaDialogState,
} from "@/types/criteria.types";

type UseScoringCriteriaDialogArgs = {
  state: ScoringCriteriaDialogState | null;
  onClose: () => void;
};

export function useScoringCriteriaDialog({
  state,
  onClose,
}: UseScoringCriteriaDialogArgs) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CriteriaFormValues>(() =>
    toScoringCriteriaFormValues(state?.criteria),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(toScoringCriteriaFormValues(state?.criteria));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.criteria?.id, state?.mode]);

  const createMutation = useMutation({
    mutationFn: () => criteriaApi.createScoringCriteria(toCreateScoringCriteriaPayload(values)),
    onSuccess: async () => {
      enqueueSnackbar("Scoring criteria created.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["scoring-criteria"] });
      onClose();
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to create criteria."), {
        variant: "error",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      criteriaApi.updateScoringCriteria(
        state?.criteria?.id as UUID,
        toUpdateScoringCriteriaPayload(values),
      ),
    onSuccess: async () => {
      enqueueSnackbar("Scoring criteria updated.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["scoring-criteria"] });
      onClose();
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to update criteria."), {
        variant: "error",
      }),
  });

  const isEdit = state?.mode === "EDIT";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const errorMessage = getFirstScoringCriteriaError(values);
    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: "error" });
      return;
    }

    if (isEdit) updateMutation.mutate();
    else createMutation.mutate();
  };

  return {
    values,
    setValues,
    isEdit,
    isPending,
    handleSubmit,
  };
}
