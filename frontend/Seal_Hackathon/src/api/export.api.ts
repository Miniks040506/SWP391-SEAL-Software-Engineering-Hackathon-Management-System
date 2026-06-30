import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateExportJobRequest,
  EventExportRequest,
  ExportDownloadResponse,
  ExportJobResponse,
  GetExportJobsParams,
} from "@/types/export.types";

export const exportApi = {
  createExportJob(payload: CreateExportJobRequest) {
    return apiRequest.post<ExportJobResponse>("/exports", payload);
  },

  exportEventRanking(eventId: UUID, payload?: EventExportRequest) {
    return apiRequest.post<ExportJobResponse>(
      `/events/${eventId}/exports/ranking`,
      payload ?? {},
    );
  },

  exportEventScores(eventId: UUID, payload?: EventExportRequest) {
    return apiRequest.post<ExportJobResponse>(
      `/events/${eventId}/exports/scores`,
      payload ?? {},
    );
  },

  exportEventTeamList(eventId: UUID, payload?: EventExportRequest) {
    return apiRequest.post<ExportJobResponse>(
      `/events/${eventId}/exports/team-list`,
      payload ?? {},
    );
  },

  getMyExportJobs(params?: GetExportJobsParams) {
    return apiRequest.get<PageResponse<ExportJobResponse>>("/exports", {
      params,
    });
  },

  getExportJobById(exportId: UUID) {
    return apiRequest.get<ExportJobResponse>(`/exports/${exportId}`);
  },

  getExportJobStatus(jobId: UUID) {
    return apiRequest.get<ExportJobResponse>(`/export-jobs/${jobId}`);
  },

  downloadExport(exportId: UUID) {
    return apiRequest.get<ExportDownloadResponse>(
      `/exports/${exportId}/download`,
    );
  },

  downloadExportJob(jobId: UUID) {
    return apiRequest.get<ExportDownloadResponse>(
      `/export-jobs/${jobId}/download`,
    );
  },

  getDownloadFileUrl(exportId: UUID) {
    return `/api/v1/exports/${exportId}/download-file`;
  },

  getExportJobDownloadFileUrl(jobId: UUID) {
    return `/api/v1/export-jobs/${jobId}/download-file`;
  },

  retryExport(exportId: UUID) {
    return apiRequest.post<ExportJobResponse>(`/exports/${exportId}/retry`);
  },

  deleteExport(exportId: UUID) {
    return apiRequest.delete<void>(`/exports/${exportId}`);
  },
};
