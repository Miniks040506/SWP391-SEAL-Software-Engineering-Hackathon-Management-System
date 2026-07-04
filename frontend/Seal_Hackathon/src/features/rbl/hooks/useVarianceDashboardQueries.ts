import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/api/event.api";
import type { UUID } from "@/types/common.types";
import type { GetVarianceDashboardParams } from "@/types/event.types";
import type { VarianceDashboardResponse } from "@/types/system.types";

export const varianceDashboardKeys = {
  all: ["variance-dashboard"] as const,
  detail: (eventId: UUID, params?: GetVarianceDashboardParams) =>
    [...varianceDashboardKeys.all, eventId, params] as const,
};

export function useVarianceDashboardQuery(
  eventId: UUID,
  params?: GetVarianceDashboardParams
) {
  return useQuery<VarianceDashboardResponse>({
    queryKey: varianceDashboardKeys.detail(eventId, params),
    queryFn: () => eventApi.getVarianceDashboard(eventId, params),
    enabled: Boolean(eventId),
    refetchInterval: 15_000,
    placeholderData: (previous) => previous,
  });
}
