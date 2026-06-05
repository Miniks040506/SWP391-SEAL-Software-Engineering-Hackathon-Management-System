import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { getEventCriteriaReadonlyReason, statusAllowsEventCriteriaEdit } from "@/features/criteria/utils/eventCriteriaRules";
import type { UUID } from "@/types/common.types";

export function useEventCriteriaManagementPage(eventId?: UUID) {
  const eventQuery = useQuery({
    queryKey: ["coordinator-event-detail", eventId],
    queryFn: () => eventApi.getEventById(eventId as UUID),
    enabled: Boolean(eventId),
  });

  const roundsQuery = useQuery({
    queryKey: ["coordinator-event-rounds", eventId],
    queryFn: () => roundApi.getRoundsByEvent(eventId as UUID),
    enabled: Boolean(eventId),
  });

  const event = eventQuery.data;
  const canEdit = useMemo(
    () => statusAllowsEventCriteriaEdit(event?.status ?? null),
    [event?.status],
  );

  return {
    event,
    rounds: roundsQuery.data ?? [],
    eventQuery,
    roundsQuery,
    canEdit,
    readonlyReason: getEventCriteriaReadonlyReason(event?.status ?? null),
  };
}
