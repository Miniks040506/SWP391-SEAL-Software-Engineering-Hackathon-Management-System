import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportApi } from "@/api/export.api";
import { mockExportApi } from "../mocks/export.mock";
import { useSnackbar } from "notistack";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateExportJobRequest,
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

type ExportApiError = {
  response?: { data?: { message?: string } };
  message?: string;
};

const getExportErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ExportApiError;
  return apiError.response?.data?.message || apiError.message || fallback;
};

export const exportKeys = {
  all: ["exports"] as const,
  lists: () => [...exportKeys.all, "list"] as const,
  list: (params?: GetExportJobsParams) =>
    [...exportKeys.lists(), params] as const,
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
    mutationFn: async ({
      eventId,
      payload,
    }: {
      eventId: UUID;
      payload?: EventExportRequest;
    }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventRanking(eventId, payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar(
        job.status === "FAILED"
          ? job.errorMessage || "Ranking workbook could not be created."
          : "Ranking workbook saved to Recent exports.",
        { variant: job.status === "FAILED" ? "error" : "success" },
      );
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getExportErrorMessage(error, "Failed to create ranking export"),
        { variant: "error" },
      );
    },
  });
}

export function useCreateScoresExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({
      eventId,
      payload,
    }: {
      eventId: UUID;
      payload?: EventExportRequest;
    }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventScores(eventId, payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar(
        job.status === "FAILED"
          ? job.errorMessage || "Score workbook could not be created."
          : "Score workbook saved to Recent exports.",
        { variant: job.status === "FAILED" ? "error" : "success" },
      );
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getExportErrorMessage(error, "Failed to create score export"),
        { variant: "error" },
      );
    },
  });
}

export function useCreateTeamListExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({
      eventId,
      payload,
    }: {
      eventId: UUID;
      payload?: EventExportRequest;
    }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportEventTeamList(eventId, payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar(
        job.status === "FAILED"
          ? job.errorMessage || "Team list workbook could not be created."
          : "Team list workbook saved to Recent exports.",
        { variant: job.status === "FAILED" ? "error" : "success" },
      );
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getExportErrorMessage(error, "Failed to create team list export"),
        { variant: "error" },
      );
    },
  });
}

export function useCreateGenericExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: CreateExportJobRequest) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.createExportJob(payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar(
        job.status === "FAILED"
          ? job.errorMessage || "The Excel workbook could not be created."
          : `${job.exportType.replace(/_/g, " ")} workbook saved to Recent exports.`,
        { variant: job.status === "FAILED" ? "error" : "success" },
      );
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
      queryClient.setQueryData(exportKeys.detail(job.id), job);
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      enqueueSnackbar(
        error.response?.data?.message ||
          error.message ||
          "Failed to create export",
        { variant: "error" },
      );
    },
  });
}

export function useCreateRblDatasetExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({
      eventId,
      payload,
    }: {
      eventId: UUID;
      payload?: ExportRblDatasetRequest;
    }) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.exportRblDataset(eventId, payload),
      ),
    onSuccess: (job) => {
      enqueueSnackbar("Anonymized RBL dataset export created.", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
      queryClient.setQueryData(exportKeys.detail(job.id), job);
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getExportErrorMessage(
          error,
          "Failed to create anonymized RBL dataset export",
        ),
        { variant: "error" },
      );
    },
  });
}

export function useDownloadExport() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (exportId: UUID) => {
      const metadata = unwrapApiPayload<ExportDownloadResponse>(
        await activeApi.downloadExport(exportId),
      );
      const file = await activeApi.downloadExportFile(exportId);
      return { metadata, file };
    },
    onSuccess: ({ metadata, file }) => {
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = metadata.fileName || "seal-export";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      enqueueSnackbar(`Download started: ${link.download}`, {
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getExportErrorMessage(error, "Failed to download export"),
        { variant: "error" },
      );
    },
  });
}

export function useRetryExport() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (exportId: UUID) =>
      unwrapApiPayload<ExportJobResponse>(
        await activeApi.retryExport(exportId),
      ),
    onSuccess: () => {
      enqueueSnackbar("Export job queued for retry.", { variant: "info" });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getExportErrorMessage(error, "Failed to retry export"), {
        variant: "error",
      });
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
      enqueueSnackbar("Export job deleted successfully.", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getExportErrorMessage(error, "Failed to delete export"), {
        variant: "error",
      });
    },
  });
}
