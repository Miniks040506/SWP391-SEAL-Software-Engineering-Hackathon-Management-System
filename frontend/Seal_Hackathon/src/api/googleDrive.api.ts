import { apiRequest } from "@/api/apiRequest";
import type { ISODateTime } from "@/types/common.types";

export type GoogleDriveConnectionStatus = {
  available: boolean;
  availabilityMessage: string;
  connected: boolean;
  accountEmail?: string | null;
  connectedAt?: ISODateTime | null;
  tokenExpiresAt?: ISODateTime | null;
};

export type GoogleDriveOAuthStart = {
  authorizationUrl: string;
  expiresAt: ISODateTime;
};

export type GoogleDrivePickerSession = {
  accessToken: string;
  expiresAt: ISODateTime;
  pickerApiKey: string;
  appId: string;
};

export const googleDriveApi = {
  getStatus() {
    return apiRequest.get<GoogleDriveConnectionStatus>(
      "/integrations/google-drive/status",
    );
  },

  connect(returnPath: string) {
    return apiRequest.post<GoogleDriveOAuthStart>(
      "/integrations/google-drive/connect",
      undefined,
      { params: { returnPath } },
    );
  },

  getPickerSession() {
    return apiRequest.get<GoogleDrivePickerSession>(
      "/integrations/google-drive/picker-session",
    );
  },

  disconnect() {
    return apiRequest.delete<void>("/integrations/google-drive");
  },
};
