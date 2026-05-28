import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateExportJobRequest,
  ExportDownloadResponse,
  ExportJobResponse,
  GetExportJobsParams,
} from "@/types/export.types";

export const exportApi = {
  createExportJob(payload: CreateExportJobRequest) {
    return apiRequest.post<ExportJobResponse>("/exports", payload);
  },

  getMyExportJobs(params?: GetExportJobsParams) {
    return apiRequest.get<PageResponse<ExportJobResponse>>("/exports", {params});
  },

  getExportJobById(exportId: UUID) {
    return apiRequest.get<ExportJobResponse>(`/exports/${exportId}`);
  },

  downloadExport(exportId: UUID) {
    return apiRequest.get<ExportDownloadResponse>(
      `/exports/${exportId}/download`,
    );
  },

  retryExport(exportId: UUID) {
    return apiRequest.post<ExportJobResponse>(`/exports/${exportId}/retry`);
  },

  deleteExport(exportId: UUID) {
    return apiRequest.delete<void>(`/exports/${exportId}`);
  },
};
