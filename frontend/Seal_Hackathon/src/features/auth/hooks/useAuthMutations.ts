import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/authStore";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: authApi.resendVerification,
  });
}

export function useLoginMutation() {
  const setLoginResponse = useAuthStore((state) => state.setLoginResponse);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setLoginResponse(response);
    },
  });
}

export function useLogoutMutation() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
