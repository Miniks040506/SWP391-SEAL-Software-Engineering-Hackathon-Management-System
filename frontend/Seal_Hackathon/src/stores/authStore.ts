import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuthUser,
  LoginResponse,
  RefreshTokenResponse,
} from "@/types/auth.types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  isAuthenticated: () => boolean;
  setLoginResponse: (payload: LoginResponse) => void;
  setTokens: (payload: RefreshTokenResponse) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      isAuthenticated: () => Boolean(get().accessToken),

      setLoginResponse: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: {
            id: payload.userId,
            email: payload.email,
            fullName: payload.fullName,
            role: payload.role,
            status: payload.status,
          },
        });
      },

      setTokens: (payload) => {
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },
    }),
    {
      name: "seal-auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
