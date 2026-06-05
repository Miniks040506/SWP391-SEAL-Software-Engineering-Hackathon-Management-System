import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

import { criteriaApi } from "@/api/criteria.api";
import {
  getFirstEventCriteriaError,
  toCreateEventCriteriaPayload,
  toEventCriteriaFormValues,
  toUpdateEventCriteriaPayload,
} from "@/features/criteria/schemas/eventCriteria.schema";
import { getCriteriaErrorMessage } from "@/features/criteria/utils/criteriaView";
import type { UUID } from "@/types/common.types";
import type {
  EventCriteriaDialogState,
  EventCriteriaFormValues,
} from "@/types/criteria.types";

type UseEventCriteriaDialogArgs = {
  eventId: UUID;
  state: EventCriteriaDialogState | null;
  onClose: () => void;
};

export function useEventCriteriaDialog({
  eventId,
  state,
  onClose,
}: UseEventCriteriaDialogArgs) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EventCriteriaFormValues>(() =>
    toEventCriteriaFormValues(state?.criteria),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(toEventCriteriaFormValues(state?.criteria));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.criteria?.id, state?.mode]);

  const createMutation = useMutation({
    mutationFn: () =>
      criteriaApi.createEventCriteria(eventId, toCreateEventCriteriaPayload(values)),
    onSuccess: async () => {
      enqueueSnackbar("Event criteria created.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["event-criteria", eventId] });
      onClose();
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to create event criteria."), {
        variant: "error",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      criteriaApi.updateEventCriteria(
        state?.criteria?.id as UUID,
        toUpdateEventCriteriaPayload(values),
      ),
    onSuccess: async () => {
      enqueueSnackbar("Event criteria updated.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["event-criteria", eventId] });
      onClose();
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to update event criteria."), {
        variant: "error",
      }),
  });

  const isEdit = state?.mode === "EDIT";
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const errorMessage = getFirstEventCriteriaError(values, { isEdit });
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
    isSubmitting,
    handleSubmit,
  };
}
