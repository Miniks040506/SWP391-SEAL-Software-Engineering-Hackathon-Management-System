import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportApi } from "@/api/export.api";
import { mockExportApi } from "../mocks/export.mock";
import { useSnackbar } from "notistack";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  EventExportRequest,
  ExportDownloadResponse,
  ExportJobResponse,
  ExportRblDatasetRequest,
  GetExportJobsParams,
} from "@/types/export.types";

const USE_MOCK = false;
const activeApi = USE_MOCK ? mockExportApi : exportApi;

type ApiPayload<T> = T | { data: T };

const unwrapApiPayload = <T>(response: ApiPayload<T>): T => {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
};

export const exportKeys = {
  all: ["exports"] as const,
  lists: () => [...exportKeys.all, "list"] as const,
  list: (params?: GetExportJobsParams) => [...exportKeys.lists(), params] as const,
  details: () => [...exportKeys.all, "detail"] as const,
  detail: (id: UUID) => [...exportKeys.details(), id] as const,
};

export function useExportJobsQuery(params?: GetExportJobsParams) {
  return useQuery<PageResponse<ExportJobResponse>>({
    queryKey: exportKeys.list(params),
    queryFn: async () =>
      unwrapApiPayload<PageResponse<ExportJobResponse>>(
        await activeApi.getMyExportJobs(params),
      ),
  });
}

export function useExportJobQuery(jobId: UUID) {
  return useQuery<ExportJobResponse>({
    queryKey: exportKeys.detail(jobId),
    queryFn: async () =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.getExportJobById(jobId),
      ),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "QUEUED" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

export function useCreateRankingExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventRanking(eventId, payload),
      ),
    onSuccess: () => {
      enqueueSnackbar("Ranking export job created successfully.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create ranking export", { variant: "error" });
    },
  });
}

export function useCreateScoresExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventScores(eventId, payload),
      ),
    onSuccess: () => {
      enqueueSnackbar("Score export job created successfully.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create score export", { variant: "error" });
    },
  });
}

export function useCreateTeamListExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: UUID; payload?: EventExportRequest }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventTeamList(eventId, payload),
      ),
    onSuccess: () => {
      enqueueSnackbar("Team list export job created successfully.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to create team list export", { variant: "error" });
    },
  });
}

export function useCreateRblDatasetExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: UUID; payload?: ExportRblDatasetRequest }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportRblDataset(eventId, payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar("Anonymized RBL dataset export created.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
      queryClient.setQueryData(exportKeys.detail(job.id), job);
    },
    onError: (err: any) => {
      enqueueSnackbar(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create anonymized RBL dataset export",
        { variant: "error" },
      );
    },
  });
}

export function useDownloadExport() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (exportId: UUID) => {
      return unwrapApiPayload<ExportDownloadResponse>(
        await activeApi.downloadExport(exportId),
      );
    },
    onSuccess: (data) => {
      if (USE_MOCK) {
        enqueueSnackbar(`Downloading mock file: ${data.fileName}`, { variant: "info" });
      } else {
        // Open download url in new tab
        window.open(data.downloadUrl, "_blank");
      }
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to download export", { variant: "error" });
    },
  });
}

export function useRetryExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (exportId: UUID) =>
      unwrapApiPayload<ExportJobResponse>(await activeApi.retryExport(exportId)),
    onSuccess: () => {
      enqueueSnackbar("Export job queued for retry.", { variant: "info" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to retry export", { variant: "error" });
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (exportId: UUID) =>
      unwrapApiPayload<void>(await activeApi.deleteExport(exportId)),
    onSuccess: () => {
      enqueueSnackbar("Export job deleted successfully.", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (err: any) => {
      enqueueSnackbar(err?.message || "Failed to delete export", { variant: "error" });
    },
  });
}
