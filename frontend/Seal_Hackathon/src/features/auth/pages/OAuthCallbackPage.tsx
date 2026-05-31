import { CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import type { LoginResponse, UserRole } from "@/types/auth.types";
import { getRoleRedirectPath } from "@/utils/roleRedirect";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setLoginResponse = useAuthStore((state) => state.setLoginResponse);

  useEffect(() => {
    const oauthError = searchParams.get("oauthError");
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status") || "";
    const email = searchParams.get("email") || "";
    const fullName = searchParams.get("fullName") || email;
    const userId = searchParams.get("userId") || "";
    const avatarUrl = searchParams.get("avatarUrl") || null;

    if (oauthError) {
      const errorKey = `oauth-error:${oauthError}`;

      if (!sessionStorage.getItem(errorKey)) {
        sessionStorage.setItem(errorKey, "handled");

        enqueueSnackbar(oauthError, {
          variant: "error",
        });
      }

      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!accessToken || !refreshToken || !role || !email) {
      const errorKey = "oauth-error:missing-params";

      if (!sessionStorage.getItem(errorKey)) {
        sessionStorage.setItem(errorKey, "handled");

        enqueueSnackbar("OAuth login failed.", {
          variant: "error",
        });
      }

      navigate("/login", {
        replace: true,
      });

      return;
    }

    const response: LoginResponse = {
      userId,
      email,
      fullName,
      role,
      status,
      accessToken,
      refreshToken,
      avatarUrl,
      accessTokenExpiresInMs: 0,
      refreshTokenExpiresInMs: 0,
    };

    setLoginResponse(response);

    const successKey = `oauth-success:${email}:${accessToken.slice(0, 24)}`;

    if (!sessionStorage.getItem(successKey)) {
      sessionStorage.setItem(successKey, "handled");

      enqueueSnackbar("Login successfully.", {
        variant: "success",
      });
    }

    navigate(getRoleRedirectPath(useAuthStore.getState().user), {
      replace: true,
    });
  }, [navigate, searchParams, setLoginResponse]);

  return (
    <div className="flex min-h-90 flex-col items-center justify-center gap-4">
      <CircularProgress />
      <p className="text-sm font-semibold text-slate-500">
        Completing OAuth login...
      </p>
    </div>
  );
}