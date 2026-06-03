import { apiRequest } from "@/api/apiRequest";

export type UploadEventBannerResponse = {
  url: string;
};

export const eventAssetApi = {
  uploadEventBanner(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return apiRequest.postForm<UploadEventBannerResponse>(
      "/events/banner",
      formData,
    );
  },
};
