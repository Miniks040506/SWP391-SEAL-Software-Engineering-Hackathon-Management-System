import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import { profileKeys } from "@/features/profile/hooks/useProfileQueries";
import { useAuthStore } from "@/stores/authStore";
import type {
  ChangePasswordRequest,
  MyProfileResponse,
  UpdateMyProfileRequest,
} from "@/types/user.types";

function syncAuthUser(profile: MyProfileResponse) {
  const store = useAuthStore.getState();
  const currentUser = store.user;

  if (!currentUser) return;

  store.setUser?.({
    ...currentUser,
    id: profile.id,
    userId: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role as any,
    status: profile.status,
    avatarUrl: profile.avatarUrl,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyProfileRequest) =>
      userApi.updateMyProfile(payload),

    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me(), profile);
      syncAuthUser(profile);
    },
  });
}

export function useUploadMyAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadMyAvatar(file),

    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me(), profile);
      syncAuthUser(profile);
    },
  });
}

export function useChangeMyPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) =>
      userApi.changeMyPassword(payload),
  });
}
