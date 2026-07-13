import type { ISODateTime, UUID } from "@/types/common.types";

export type ExportType =
  | "RANKING"
  | "SCORE_REPORT"
  | "TEAM_LIST"
  | "SCORE_DATASET_ANONYMIZED"
  | "CALIBRATION_REPORT"
  | "FULL_EVENT_REPORT"
  | "ADMIN_ANNUAL_REPORT";

export type ExportJobStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED";

export type ExportFormat = "CSV" | "XLSX";

export type CreateExportJobRequest = {
  exportType: ExportType | string;
  params: {
    eventId?: UUID;
    roundId?: UUID;
    trackId?: UUID;
    year?: number;
    season?: "SPRING" | "SUMMER" | "FALL" | string;
    format?: ExportFormat;
    includeDraftScores?: boolean;
    includeDisqualified?: boolean;
    anonymize?: boolean;
    [key: string]: unknown;
  };
};

export type EventExportRequest = {
  roundId?: UUID;
  trackId?: UUID;
  format?: ExportFormat;
  includeDraftScores?: boolean;
  includeDisqualified?: boolean;
  anonymize?: boolean;
};

export type ExportJobResponse = {
  id: UUID;
  requestedBy: UUID;
  exportType: ExportType | string;
  params: Record<string, unknown>;
  status: ExportJobStatus | string;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  rowCount?: number | null;
  errorMessage?: string | null;
  requestedAt: ISODateTime;
  completedAt?: ISODateTime | null;
  expiresAt?: ISODateTime | null;
};

export type ExportDownloadResponse = {
  exportId: UUID;
  fileName: string;
  downloadUrl: string;
  expiresAt: ISODateTime;
};

export type GetExportJobsParams = {
  status?: ExportJobStatus | string;
  exportType?: ExportType | string;
  page?: number;
  size?: number;
};

export type ExportRblDatasetRequest = {
  roundId?: UUID;
  trackId?: UUID;
  format?: ExportFormat;
};
