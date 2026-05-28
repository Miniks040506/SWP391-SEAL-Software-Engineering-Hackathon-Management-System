import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateExportJobRequest = {
  exportType: string;
  params: unknown;
};

export type ExportJobResponse = {
  id: UUID;
  requestedBy: UUID;
  exportType: string;
  params: unknown;
  status: string;
  fileName?: string;
  fileSizeBytes?: number;
  rowCount?: number;
  errorMessage?: string;
  requestedAt: ISODateTime;
  completedAt?: ISODateTime;
  expiresAt?: ISODateTime;
};

export type ExportDownloadResponse = {
  exportId: UUID;
  fileName: string;
  downloadUrl: string;
  expiresAt: ISODateTime;
};

export type GetExportJobsParams = {
  status?: string;
  exportType?: string;
  page?: number;
  size?: number;
};
