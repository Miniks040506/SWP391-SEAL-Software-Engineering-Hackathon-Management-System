import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import PasswordIcon from "@mui/icons-material/Password";
import ReplayIcon from "@mui/icons-material/Replay";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { Button, CircularProgress, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { CodeInput } from "@/features/auth/components/CodeInput";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { StepProgress } from "@/features/auth/components/StepProgress";
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

const resetSteps = [
  { label: "Email" },
  { label: "Verify" },
  { label: "New Password" },
  { label: "Success" },
];

type ResetStep = 1 | 2 | 3 | 4;

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const initialEmail = searchParams.get("email") || "";

  const [currentStep, setCurrentStep] = useState<ResetStep>(
    initialEmail ? 2 : 1,
  );
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

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

  const pageState = useMemo(() => {
    if (currentStep === 1) {
      return {
        title: "Forgot Password",
        description:
          "Enter your email address and we will send a 6-digit reset code.",
        icon: <EmailIcon sx={{ fontSize: 30 }} />,
      };
    }

    if (currentStep === 2) {
      return {
        title: "Verify Reset Code",
        description:
          "Enter the 6-digit password reset code we sent to your email.",
        icon: <MarkEmailReadIcon sx={{ fontSize: 30 }} />,
      };
    }

    if (currentStep === 3) {
      return {
        title: "Create New Password",
        description: "Set a new password for your SEAL account.",
        icon: <PasswordIcon sx={{ fontSize: 30 }} />,
      };
    }

    return {
      title: "Password Reset Successfully",
      description:
        "Your password has been updated. You can now log in with your new password.",
      icon: <TaskAltIcon sx={{ fontSize: 30 }} />,
    };
  }, [currentStep]);

  const handleEmailSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      await forgotPasswordMutation.mutateAsync({
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);
      setCode("");
      setCodeError("");
      setCurrentStep(2);

      enqueueSnackbar("Password reset code sent to your email.", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Cannot send password reset code.",
        { variant: "error" },
      );
    }
  };

  const handleCodeContinue = () => {
    const parsed = resetPasswordCodeSchema.safeParse({
      code,
    });

    if (!parsed.success) {
      setCodeError(parsed.error.issues[0]?.message || "Invalid reset code.");
      return;
    }

    setCodeError("");
    setCurrentStep(3);
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

      enqueueSnackbar("Password reset code sent again.", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Cannot resend password reset code.",
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
    } catch (error: any) {
      enqueueSnackbar(
        error?.response?.data?.message || "Cannot reset password.",
        { variant: "error" },
      );

      if (error?.response?.status === 400 || error?.response?.status === 404) {
        setCurrentStep(2);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-155 py-16">
      <StepProgress
        title="Reset Password Progress"
        currentStep={currentStep}
        steps={resetSteps}
      />

      <AuthCard title={pageState.title} description={pageState.description}>
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_12px_24px_rgba(59,130,246,0.25)]">
          {pageState.icon}
        </div>

        {currentStep === 1 && (
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="space-y-5"
          >
            <TextField
              fullWidth
              size="small"
              label="Email"
              placeholder="alex.n@fpt.edu.vn"
              {...emailForm.register("email")}
              error={Boolean(emailForm.formState.errors.email)}
              helperText={emailForm.formState.errors.email?.message}
              sx={textFieldSx}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={forgotPasswordMutation.isPending}
              startIcon={
                forgotPasswordMutation.isPending ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <LockResetIcon />
                )
              }
              sx={{
                height: 46,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {forgotPasswordMutation.isPending
                ? "Sending code..."
                : "Send reset code"}
            </Button>

            <div className="text-center">
              <Link
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline"
                to="/login"
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Back to login
              </Link>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 text-center">
            <p className="text-sm leading-6 text-slate-600">
              Code sent to{" "}
              <span className="font-bold text-blue-500">{email}</span>
            </p>

            <CodeInput
              value={code}
              onChange={(nextCode) => {
                setCode(nextCode);
                setCodeError("");
              }}
              error={codeError}
            />

            {codeError && (
              <p className="text-sm font-semibold text-rose-500">
                {codeError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outlined"
                onClick={() => setCurrentStep(1)}
                startIcon={<ArrowBackIcon />}
                sx={{
                  height: 42,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Change email
              </Button>

              <Button
                type="button"
                variant="outlined"
                onClick={handleResendCode}
                disabled={forgotPasswordMutation.isPending}
                startIcon={<ReplayIcon />}
                sx={{
                  height: 42,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Resend code
              </Button>
            </div>

            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={handleCodeContinue}
              disabled={code.length !== 6}
              sx={{
                height: 46,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-5"
          >
            <PasswordField
              fullWidth
              size="small"
              label="New Password"
              {...passwordForm.register("newPassword")}
              error={Boolean(passwordForm.formState.errors.newPassword)}
              helperText={passwordForm.formState.errors.newPassword?.message}
              sx={textFieldSx}
            />

            <PasswordField
              fullWidth
              size="small"
              label="Confirm Password"
              {...passwordForm.register("confirmPassword")}
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
              helperText={passwordForm.formState.errors.confirmPassword?.message}
              sx={textFieldSx}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outlined"
                onClick={() => setCurrentStep(2)}
                startIcon={<ArrowBackIcon />}
                sx={{
                  height: 42,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={resetPasswordMutation.isPending}
                sx={{
                  height: 42,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "none",
                }}
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset password"}
              </Button>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <p className="text-base leading-7 text-slate-600">
              Your password has been reset successfully.
            </p>

            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                height: 46,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              Go to Log In
            </Button>
          </div>
        )}
      </AuthCard>
    </div>
  );
}
