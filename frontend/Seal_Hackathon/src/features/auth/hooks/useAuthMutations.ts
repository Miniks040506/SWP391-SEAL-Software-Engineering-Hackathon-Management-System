import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";

export function useRegisterMutation() {
  return useMutation({ mutationFn: authApi.register });
}

export function useVerifyEmailMutation() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useResendVerificationMutation() {
  return useMutation({ mutationFn: authApi.resendVerification });
}

export function useLoginMutation() {
  return useMutation({ mutationFn: authApi.login });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: authApi.resetPassword });
}