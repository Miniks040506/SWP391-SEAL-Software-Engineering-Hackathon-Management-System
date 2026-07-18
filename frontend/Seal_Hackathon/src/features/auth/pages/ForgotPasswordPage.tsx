import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ReplayIcon from "@mui/icons-material/Replay";
import { Button, CircularProgress, TextField } from "@mui/material";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authTextFieldSx } from "@/features/auth/components/authFieldStyles";
import { CodeInput } from "@/features/auth/components/CodeInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { ResetPasswordShell } from "@/features/auth/components/ResetPasswordShell";
import { PASSWORD_RULES } from "@/features/auth/utils/password";
import {
  forgotPasswordSchema,
  resetPasswordCodeSchema,
  resetPasswordNewPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordNewPasswordFormValues,
} from "@/features/auth/schemas/auth.schema";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/features/auth/hooks/useAuthMutations";
import type { AuthErrorResponse } from "@/types/auth.types";

type ResetStep = 1 | 2 | 3 | 4;
type ResetCodeStatus = "input" | "error";

function getAuthErrorPayload(error: unknown) {
  return isAxiosError<AuthErrorResponse>(error) ? error.response?.data : undefined;
}

const gradientButtonSx = {
  height: 50,
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 800,
  fontSize: 16,
  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
  boxShadow: "0 10px 24px rgba(59,130,246,0.35)",
  transition: "box-shadow 200ms ease, transform 200ms ease",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    boxShadow: "0 12px 28px rgba(59,130,246,0.45)",
  },
  "&:active": {
    transform: "translateY(1px)",
    boxShadow: "0 6px 16px rgba(59,130,246,0.3)",
  },
  "&.Mui-disabled": {
    background: "#93c5fd",
    color: "#ffffff",
  },
};

const outlinedButtonSx = {
  height: 50,
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: 15,
  borderColor: "#e2e8f0",
  color: "#475569",
  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  ".dark &": {
    borderColor: "#334155",
    color: "#cbd5e1",
  },
  ".dark &:hover": {
    borderColor: "#475569",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
};

function StepBadge({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
      {children}
    </span>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const initialEmail = searchParams.get("email") || "";
  const initialCodeParam = searchParams.get("code") || "";
  const initialCodeResult = resetPasswordCodeSchema.safeParse({
    code: initialCodeParam,
  });
  const initialCode = initialCodeResult.success
    ? initialCodeResult.data.code
    : "";

  const [currentStep, setCurrentStep] = useState<ResetStep>(
    initialEmail ? (initialCode ? 3 : 2) : 1,
  );
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [codeError, setCodeError] = useState("");
  const [codeStatus, setCodeStatus] = useState<ResetCodeStatus>("input");

  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const passwordForm = useForm<ResetPasswordNewPasswordFormValues>({
    resolver: zodResolver(resetPasswordNewPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = passwordForm.watch("newPassword") ?? "";

  const handleEmailSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      await forgotPasswordMutation.mutateAsync({
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);
      setCode("");
      setCodeError("");
      setCodeStatus("input");
      setCurrentStep(2);

      enqueueSnackbar("Password reset code sent to your email.", {
        variant: "success",
      });
    } catch (error: unknown) {
      const errorPayload = getAuthErrorPayload(error);
      enqueueSnackbar(
        errorPayload?.message || "Cannot send password reset code.",
        { variant: "error" },
      );
    }
  };

  const acceptResetCode = (nextCode: string) => {
    const parsed = resetPasswordCodeSchema.safeParse({
      code: nextCode,
    });

    if (!parsed.success) {
      setCodeStatus("error");
      setCodeError(parsed.error.issues[0]?.message || "Invalid reset code.");
      return;
    }

    setCodeStatus("input");
    setCodeError("");
    setCurrentStep(3);
  };

  const handleCodeChange = (nextCode: string) => {
    const cleaned = nextCode.replace(/\D/g, "").slice(0, 6);

    setCode(cleaned);

    if (codeStatus === "error") {
      setCodeStatus("input");
      setCodeError("");
    }

    if (cleaned.length === 6) {
      window.setTimeout(() => {
        acceptResetCode(cleaned);
      }, 0);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setCurrentStep(1);
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        email,
      });

      setCode("");
      setCodeError("");
      setCodeStatus("input");

      enqueueSnackbar("Password reset code sent again.", {
        variant: "success",
      });
    } catch (error: unknown) {
      const errorPayload = getAuthErrorPayload(error);
      enqueueSnackbar(
        errorPayload?.message || "Cannot resend password reset code.",
        { variant: "error" },
      );
    }
  };

  const handlePasswordSubmit = async (
    values: ResetPasswordNewPasswordFormValues,
  ) => {
    try {
      const parsedCode = resetPasswordCodeSchema.parse({
        code,
      });

      await resetPasswordMutation.mutateAsync({
        email,
        code: parsedCode.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      setCurrentStep(4);

      enqueueSnackbar("Password has been reset.", {
        variant: "success",
      });
    } catch (error: unknown) {
      const errorPayload = getAuthErrorPayload(error);
      const errorMessage = errorPayload?.message || "Cannot reset password.";

      enqueueSnackbar(
        errorMessage,
        { variant: "error" },
      );

      if (errorPayload?.code === "RESET_CODE_INVALID_OR_EXPIRED") {
        setCodeStatus("error");
        setCodeError(errorMessage);
        setCurrentStep(2);
        return;
      }

      const passwordFieldErrors = errorPayload?.fieldErrors?.filter(
        (fieldError) => fieldError.field === "newPassword"
          || fieldError.field === "confirmPassword",
      ) ?? [];

      passwordFieldErrors.forEach((fieldError) => {
        passwordForm.setError(fieldError.field as keyof ResetPasswordNewPasswordFormValues, {
          type: "server",
          message: fieldError.message,
        });
      });

      if (passwordFieldErrors.length === 0) {
        const targetField = errorPayload?.code === "PASSWORD_CONFIRMATION_MISMATCH"
          ? "confirmPassword"
          : "newPassword";

        passwordForm.setError(targetField, {
          type: "server",
          message: errorMessage,
        });
      }
    }
  };

  return (
    <ResetPasswordShell currentStep={currentStep}>
      {currentStep === 1 && (
        <>
          <StepBadge>Step 1 of 4</StepBadge>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Forgot your password?
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
            No worries — enter the email linked to your SEAL account and we
            will send you a 6-digit reset code.
          </p>

          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="mt-8 space-y-5"
          >
            <TextField
              fullWidth
              label="Email"
              placeholder="alex.n@fpt.edu.vn"
              autoComplete="email"
              {...emailForm.register("email")}
              error={Boolean(emailForm.formState.errors.email)}
              helperText={emailForm.formState.errors.email?.message}
              sx={authTextFieldSx}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={forgotPasswordMutation.isPending}
              startIcon={
                forgotPasswordMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
              sx={gradientButtonSx}
            >
              {forgotPasswordMutation.isPending
                ? "Sending code..."
                : "Send reset code"}
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Remembered it?{" "}
              <Link
                className="font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
                to="/login"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </>
      )}

      {currentStep === 2 && (
        <>
          <StepBadge>Step 2 of 4</StepBadge>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {codeStatus === "error" ? "Invalid reset code" : "Check your inbox"}
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
            We sent a 6-digit reset code to{" "}
            <span className="font-semibold text-blue-500">
              {email || "your email"}
            </span>
            . Enter it below to continue.
          </p>

          <div className="mt-8">
            <CodeInput
              value={code}
              onChange={handleCodeChange}
              error={codeStatus === "error"}
              disabled={forgotPasswordMutation.isPending}
            />
          </div>

          {codeStatus === "error" && codeError && (
            <p className="mt-4 text-center text-sm font-semibold text-rose-500">
              {codeError}
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                setCode("");
                setCodeError("");
                setCodeStatus("input");
                setCurrentStep(1);
              }}
              sx={outlinedButtonSx}
            >
              Change email
            </Button>

            <Button
              type="button"
              variant="outlined"
              startIcon={<ReplayIcon />}
              disabled={forgotPasswordMutation.isPending}
              onClick={handleResendCode}
              sx={outlinedButtonSx}
            >
              {forgotPasswordMutation.isPending ? "Resending..." : "Resend code"}
            </Button>
          </div>
        </>
      )}

      {currentStep === 3 && (
        <>
          <StepBadge>Step 3 of 4</StepBadge>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Create a new password
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
            Almost there. Choose a strong password you have not used before on
            SEAL.
          </p>

          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="mt-8 space-y-5"
          >
            <div>
              <PasswordField
                fullWidth
                label="New Password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
                error={Boolean(passwordForm.formState.errors.newPassword)}
                helperText={passwordForm.formState.errors.newPassword?.message}
                sx={authTextFieldSx}
              />

              <PasswordStrengthMeter password={newPasswordValue} />
            </div>

            <PasswordField
              fullWidth
              label="Confirm Password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
              helperText={passwordForm.formState.errors.confirmPassword?.message}
              sx={authTextFieldSx}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Password must contain
              </p>
              <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPasswordValue);

                  return (
                    <li
                      key={rule.label}
                      className={[
                        "flex items-center gap-2 text-sm transition-colors",
                        passed
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400",
                      ].join(" ")}
                    >
                      {passed ? (
                        <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <Button
                type="button"
                variant="outlined"
                onClick={() => setCurrentStep(2)}
                startIcon={<ArrowBackIcon />}
                sx={outlinedButtonSx}
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={resetPasswordMutation.isPending}
                startIcon={
                  resetPasswordMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={gradientButtonSx}
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset password"}
              </Button>
            </div>
          </form>
        </>
      )}

      {currentStep === 4 && (
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </div>

          <div className="mt-6">
            <StepBadge>Step 4 of 4</StepBadge>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Password reset successfully
          </h2>
          <p className="mx-auto mt-2 max-w-95 text-base leading-7 text-slate-500 dark:text-slate-400">
            Your password has been updated. Sign in with your new password to
            get back to your team.
          </p>

          <Button
            type="button"
            fullWidth
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{ ...gradientButtonSx, mt: 4 }}
          >
            Go to Log In
          </Button>

          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
            Or head back to the{" "}
            <Link
              className="font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
              to="/"
            >
              home page
            </Link>
          </p>
        </div>
      )}
    </ResetPasswordShell>
  );
}
