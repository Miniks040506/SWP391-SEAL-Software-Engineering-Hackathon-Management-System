import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

export function useMyProfileQuery() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: userApi.getMyProfile,
  });
}