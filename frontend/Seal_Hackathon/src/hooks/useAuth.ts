import { useAuthStore } from '@/stores/authStore';

/**
 * useAuth
 *
 * Thin wrapper around authStore.
 * Khi có API thật, chỉ cần sửa file này — các component khác không cần đổi.
 *
 * TODO (khi có API):
 *  1. Gọi auth.api.ts để lấy token
 *  2. Gọi setAuth(user, accessToken, refreshToken) sau khi login thành công
 *  3. Xử lý refresh token tại axiosClient.ts
 */
export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTokens = useAuthStore((s) => s.setTokens);
  const logout = useAuthStore((s) => s.logout);

  const isAuthenticated = !!user && !!accessToken;

  return { isAuthenticated, user, accessToken, setAuth, setTokens, logout };
};