import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/api/system.api";

export const systemQueryKeys = {
  all: ["system"] as const,
  config: (params?: { category?: string; includeSecrets?: boolean }) =>
    [...systemQueryKeys.all, "config", params] as const,
  health: () => [...systemQueryKeys.all, "health"] as const,
};

export const useSystemConfigQuery = (params?: { category?: string; includeSecrets?: boolean }) =>
  useQuery({
    queryKey: systemQueryKeys.config(params),
    queryFn: () => systemApi.getSystemConfig(params),
  });

export const useSystemHealthQuery = () =>
  useQuery({
    queryKey: systemQueryKeys.health(),
    queryFn: () => systemApi.getSystemHealth(),
  });
