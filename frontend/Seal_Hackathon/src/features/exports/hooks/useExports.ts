import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportApi } from "@/api/export.api";
import { mockExportApi } from "../mocks/export.mock";
import { useNotification } from "@/features/notification/hooks/useNotification";
import type { UUID } from "@/types/common.types";
import type {
  EventExportRequest,
  GetExportJobsParams,
} from "@/types/export.types";

const USE_MOCK = true;
const activeApi = USE_MOCK ? mockExportApi : exportApi;

export const exportKeys = {
  all: ["exports"] as const,
  lists: () => [...exportKeys.all, "list"] as const,
  list: (params?: GetExportJobsParams) => [...exportKeys.lists(), params] as const,
  details: () => [...exportKeys.all, "detail"] as const,
  detail: (id: UUID) => [...exportKeys.details(), id] as const,
};

export function useExportJobsQuery(params?: GetExportJobsParams) {
  return useQuery({
    queryKey: exportKeys.list(params),
    queryFn: () => activeApi.getMyExportJobs(params),
  });
}

export function useExportJobQuery(jobId: UUID) {
  return useQuery({
    queryKey: exportKeys.detail(jobId),
    queryFn: () => activeApi.getExportJobById(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === "QUEUED" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

export function useCreateRankingExport() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      activeApi.exportEventRanking(eventId, payload),
    onSuccess: () => {
      showNotification("Ranking export job created successfully.", "success");
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to create ranking export", "error");
    },
  });
}

export function useCreateScoresExport() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      activeApi.exportEventScores(eventId, payload),
    onSuccess: () => {
      showNotification("Score export job created successfully.", "success");
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to create score export", "error");
    },
  });
}

export function useCreateTeamListExport() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      activeApi.exportEventTeamList(eventId, payload),
    onSuccess: () => {
      showNotification("Team list export job created successfully.", "success");
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to create team list export", "error");
    },
  });
}

export function useDownloadExport() {
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: async (exportId: UUID) => {
      const { data } = await activeApi.downloadExport(exportId);
      return data;
    },
    onSuccess: (data) => {
      if (USE_MOCK) {
        showNotification(`Downloading mock file: ${data.fileName}`, "info");
      } else {
        // Open download url in new tab
        window.open(data.downloadUrl, "_blank");
      }
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to download export", "error");
    },
  });
}

export function useRetryExport() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (exportId: UUID) => activeApi.retryExport(exportId),
    onSuccess: () => {
      showNotification("Export job queued for retry.", "info");
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to retry export", "error");
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  return useMutation({
    mutationFn: (exportId: UUID) => activeApi.deleteExport(exportId),
    onSuccess: () => {
      showNotification("Export job deleted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      showNotification(err?.message || "Failed to delete export", "error");
    },
  });
}
