import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, LoginResponse } from "@/types/auth.types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;

  isAuthenticated: () => boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLogin: (response: LoginResponse) => void;
  setOAuthLogin: (data: {
    accessToken: string;
    refreshToken: string;
    role: AuthUser["role"];
    status: AuthUser["status"];
    email: string;
  }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      isAuthenticated: () => Boolean(get().accessToken && get().user),

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setLogin: (response) => {
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            userId: response.userId,
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            status: response.status,
          },
        });
      },

      setOAuthLogin: (data) => {
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            userId: "oauth-user",
            email: data.email,
            fullName: data.email,
            role: data.role,
            status: data.status,
          },
        });
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: "seal-auth-store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);