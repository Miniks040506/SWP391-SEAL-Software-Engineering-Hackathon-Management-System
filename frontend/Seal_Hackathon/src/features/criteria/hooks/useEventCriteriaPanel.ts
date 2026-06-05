import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";

import { criteriaApi } from "@/api/criteria.api";
import { booleanFilterToParam, getCriteriaErrorMessage } from "@/features/criteria/utils/criteriaView";
import {
  getEventCriteriaReadonlyReason,
  statusAllowsEventCriteriaEdit,
} from "@/features/criteria/utils/eventCriteriaRules";
import type { UUID } from "@/types/common.types";
import type {
  BooleanFilterValue,
  EventCriteriaDialogState,
  EventCriteriaResponse,
} from "@/types/criteria.types";
import type { EventDetailResponse } from "@/types/event.types";
import type { RoundResponse } from "@/types/round.types";

type UseEventCriteriaPanelArgs = {
  eventId: UUID;
  event?: EventDetailResponse | null;
  rounds?: RoundResponse[];
  canEdit?: boolean;
  readonlyReason?: string;
};

export function useEventCriteriaPanel({
  eventId,
  event,
  rounds = [],
  canEdit,
  readonlyReason,
}: UseEventCriteriaPanelArgs) {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<BooleanFilterValue>("ALL");
  const [technicalFilter, setTechnicalFilter] = useState<BooleanFilterValue>("ALL");
  const [dialogState, setDialogState] =
    useState<EventCriteriaDialogState | null>(null);
  const [viewCriteria, setViewCriteria] = useState<EventCriteriaResponse | null>(null);

  const effectiveCanEdit =
    canEdit ?? statusAllowsEventCriteriaEdit(event?.status ?? null);
  const effectiveReason =
    readonlyReason || getEventCriteriaReadonlyReason(event?.status ?? null);

  const criteriaQuery = useQuery({
    queryKey: ["event-criteria", eventId, activeFilter, technicalFilter],
    queryFn: () =>
      criteriaApi.getEventCriteria(eventId, {
        isActive: booleanFilterToParam(activeFilter),
        isTechnical: booleanFilterToParam(technicalFilter),
      }),
    enabled: Boolean(eventId),
  });

  const templateQuery = useQuery({
    queryKey: ["scoring-criteria", "active-options"],
    queryFn: () =>
      criteriaApi.getScoringCriteria({
        isActive: true,
        page: 0,
        size: 100,
      }),
    enabled: effectiveCanEdit,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: UUID) => criteriaApi.deleteEventCriteria(id),
    onSuccess: async () => {
      enqueueSnackbar("Event criteria removed.", { variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["event-criteria", eventId] });
    },
    onError: (error) =>
      enqueueSnackbar(getCriteriaErrorMessage(error, "Failed to delete event criteria."), {
        variant: "error",
      }),
  });

  const roundNameById = useMemo(
    () => new Map(rounds.map((round) => [round.id, round.name])),
    [rounds],
  );

  const openCreateDialog = () => setDialogState({ mode: "CREATE" });

  return {
    activeFilter,
    technicalFilter,
    setActiveFilter,
    setTechnicalFilter,
    dialogState,
    setDialogState,
    viewCriteria,
    setViewCriteria,
    effectiveCanEdit,
    effectiveReason,
    criteriaQuery,
    templateQuery,
    deleteMutation,
    criteria: criteriaQuery.data ?? [],
    templateOptions: templateQuery.data?.content ?? [],
    roundNameById,
    openCreateDialog,
  };
}
