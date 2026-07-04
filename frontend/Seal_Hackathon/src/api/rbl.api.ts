import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type { GetVarianceDashboardParams } from "@/types/event.types";
import type { ExportJobResponse, ExportRblDatasetRequest } from "@/types/export.types";
import type { VarianceDashboardResponse } from "@/types/system.types";

export const rblApi = {
  getVarianceDashboard(eventId: UUID, params?: GetVarianceDashboardParams) {
    return apiRequest.get<VarianceDashboardResponse>(
      `/events/${eventId}/variance-dashboard`,
      { params },
    );
  },

  exportAnonymizedDataset(eventId: UUID, payload?: ExportRblDatasetRequest) {
    return apiRequest.post<ExportJobResponse>(
      `/events/${eventId}/exports/rbl-dataset`,
      payload ?? { format: "CSV" },
    );
  },
};
