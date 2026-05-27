import { useCallback } from "react";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const isAuthenticated = Boolean(accessToken && user);

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await authApi.logout();
      }
    } catch (error) {
      console.log("LOGOUT_API_ERROR:", error);
    } finally {
      clearAuth();
    }
  }, [accessToken, clearAuth]);

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    logout,
  };
}