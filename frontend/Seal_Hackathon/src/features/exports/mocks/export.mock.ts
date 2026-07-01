import type { UUID, PageResponse } from "@/types/common.types";
import type {
  CreateExportJobRequest,
  EventExportRequest,
  ExportDownloadResponse,
  ExportJobResponse,
  GetExportJobsParams,
} from "@/types/export.types";

const mockJobs: ExportJobResponse[] = [
  {
    id: "job-1" as UUID,
    requestedBy: "user-1" as UUID,
    exportType: "RANKING",
    params: { eventId: "event-1", format: "CSV" },
    status: "DONE",
    fileName: "Ranking_Report_event-1.csv",
    fileSizeBytes: 1024 * 45, // 45 KB
    rowCount: 120,
    requestedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 59).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "job-2" as UUID,
    requestedBy: "user-1" as UUID,
    exportType: "SCORE_REPORT",
    params: { eventId: "event-1", roundId: "round-1", anonymize: true },
    status: "PROCESSING",
    requestedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "job-3" as UUID,
    requestedBy: "user-1" as UUID,
    exportType: "TEAM_LIST",
    params: { eventId: "event-2", trackId: "track-1" },
    status: "FAILED",
    errorMessage: "Database connection timeout during export",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "job-4" as UUID,
    requestedBy: "user-1" as UUID,
    exportType: "RANKING",
    params: { eventId: "event-2", format: "XLSX" },
    status: "QUEUED",
    requestedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
];

let mockJobDb = [...mockJobs];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockExportApi = {
  async createExportJob(payload: CreateExportJobRequest) {
    await delay(600);
    const newJob: ExportJobResponse = {
      id: `job-${Date.now()}` as UUID,
      requestedBy: "user-1" as UUID,
      exportType: payload.exportType,
      params: payload.params,
      status: "QUEUED",
      requestedAt: new Date().toISOString(),
    };
    mockJobDb = [newJob, ...mockJobDb];
    return { data: newJob };
  },

  async exportEventRanking(eventId: UUID, payload?: EventExportRequest) {
    return this.createExportJob({ exportType: "RANKING", params: { eventId, ...payload } });
  },

  async exportEventScores(eventId: UUID, payload?: EventExportRequest) {
    return this.createExportJob({ exportType: "SCORE_REPORT", params: { eventId, ...payload } });
  },

  async exportEventTeamList(eventId: UUID, payload?: EventExportRequest) {
    return this.createExportJob({ exportType: "TEAM_LIST", params: { eventId, ...payload } });
  },

  async getMyExportJobs(params?: GetExportJobsParams) {
    await delay(400);
    let filtered = [...mockJobDb];

    if (params?.status) {
      filtered = filtered.filter((j) => j.status === params.status);
    }
    if (params?.exportType) {
      filtered = filtered.filter((j) => j.exportType === params.exportType);
    }

    return {
      data: {
        content: filtered,
        page: params?.page || 0,
        size: params?.size || 20,
        totalElements: filtered.length,
        totalPages: 1,
      } as PageResponse<ExportJobResponse>,
    };
  },

  async getExportJobById(jobId: UUID) {
    await delay(300);
    const job = mockJobDb.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");
    return { data: job };
  },

  async getExportJobStatus(jobId: UUID) {
    return this.getExportJobById(jobId);
  },

  async downloadExport(exportId: UUID) {
    await delay(300);
    const job = mockJobDb.find((j) => j.id === exportId);
    if (!job || job.status !== "DONE") throw new Error("Export is not ready");

    const res: ExportDownloadResponse = {
      exportId,
      fileName: job.fileName || "export.csv",
      downloadUrl: `/api/v1/exports/${exportId}/download-file`,
      expiresAt: job.expiresAt || new Date().toISOString(),
    };
    return { data: res };
  },

  async downloadExportJob(jobId: UUID) {
    return this.downloadExport(jobId);
  },

  getDownloadFileUrl(exportId: UUID) {
    return `/api/v1/exports/${exportId}/download-file`;
  },

  getExportJobDownloadFileUrl(jobId: UUID) {
    return `/api/v1/export-jobs/${jobId}/download-file`;
  },

  async retryExport(exportId: UUID) {
    await delay(500);
    const idx = mockJobDb.findIndex((j) => j.id === exportId);
    if (idx === -1) throw new Error("Job not found");

    const updatedJob = {
      ...mockJobDb[idx],
      status: "QUEUED",
      errorMessage: undefined,
      requestedAt: new Date().toISOString(),
    };
    mockJobDb[idx] = updatedJob;
    return { data: updatedJob };
  },

  async deleteExport(exportId: UUID) {
    await delay(400);
    mockJobDb = mockJobDb.filter((j) => j.id !== exportId);
    return { data: undefined };
  },
};
