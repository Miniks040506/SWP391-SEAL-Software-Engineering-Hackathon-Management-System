import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButton";
import { useLoginMutation } from "@/features/auth/hooks/useAuthMutations";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/authStore";
import type { AuthLockoutErrorResponse } from "@/types/auth.types";
import { getRoleRedirectPath } from "@/utils/roleRedirect";


type LoginLockoutState = {
  message: string;
  lockedUntil?: string;
  remainingSeconds: number;
};

function formatRemainingTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getLockoutRemainingSeconds(lockout: LoginLockoutState | null) {
  if (!lockout) return 0;

  if (lockout.lockedUntil) {
    const lockedUntilMs = new Date(lockout.lockedUntil).getTime();

    if (!Number.isNaN(lockedUntilMs)) {
      return Math.max(0, Math.ceil((lockedUntilMs - Date.now()) / 1000));
    }
  }

  return Math.max(0, lockout.remainingSeconds);
}

function isLockoutErrorPayload(value: unknown): value is AuthLockoutErrorResponse {
  return Boolean(
    value
      && typeof value === "object"
      && "status" in value
      && (value as { status?: unknown }).status === 423,
  );
}

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    ".dark & fieldset": {
      borderColor: "#334155",
    },
    ".dark &:hover fieldset": {
      borderColor: "#475569",
    },
    ".dark &.Mui-focused fieldset": {
      borderColor: "#3b82f6",
    },
  },
  "& .MuiInputLabel-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-focused": {
      color: "#3b82f6",
    },
  },
  "& .MuiInputBase-input": {
    ".dark &": {
      color: "#f8fafc",
    },
    ".dark &::placeholder": {
      color: "#64748b",
      opacity: 1,
    },
  },
  "& .MuiIconButton-root": {
    ".dark &": {
      color: "#94a3b8",
    },
  },
  "& .MuiFormHelperText-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-error": {
      color: "#f43f5e",
    },
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLoginMutation();
  const [lockout, setLockout] = useState<LoginLockoutState | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const oauthError = useMemo(() => searchParams.get("oauthError"), [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLockoutSecondsLeft(getLockoutRemainingSeconds(lockout));

    if (!lockout) return undefined;

    const timerId = window.setInterval(() => {
      const secondsLeft = getLockoutRemainingSeconds(lockout);
      setLockoutSecondsLeft(secondsLeft);

      if (secondsLeft <= 0) {
        setLockout(null);
        window.clearInterval(timerId);
      }
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [lockout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      const user = useAuthStore.getState().user;
      const fallbackPath = getRoleRedirectPath(user);
      const fromPath = (location.state as { from?: string } | null)?.from;
      const redirectPath = fromPath || fallbackPath;

      enqueueSnackbar("Login successfully.", {
        variant: "success",
      });

      setLockout(null);

      navigate(redirectPath, {
        replace: true,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorPayload = error?.response?.data;

      if (error?.response?.status === 423 && isLockoutErrorPayload(errorPayload)) {
        const remainingSeconds = errorPayload.remainingSeconds ?? 15 * 60;
        const nextLockout: LoginLockoutState = {
          message: errorPayload.message
            || "Too many failed login attempts. Your account is temporarily locked.",
          // eslint-disable-next-line react-hooks/purity
          lockedUntil: new Date(Date.now() + remainingSeconds * 1000).toISOString(),
          remainingSeconds,
        };

        setLockout(nextLockout);
        enqueueSnackbar(nextLockout.message, {
          variant: "error",
        });
        return;
      }

      setLockout(null);
      enqueueSnackbar(errorPayload?.message || "Login failed.", {
        variant: "error",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-155 py-16">
      <AuthCard
        title="Welcome Back"
        description="Sign in to continue managing your SEAL Hackathon workspace."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {oauthError && (
            <Alert severity="error">
              {oauthError}
            </Alert>
          )}

          {lockout && lockoutSecondsLeft > 0 && (
            <Alert severity="error">
              {lockout.message} Try again in {formatRemainingTime(lockoutSecondsLeft)}.
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            label="Email"
            placeholder="alex.n@fpt.edu.vn"
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            sx={textFieldSx}
          />

          <PasswordField
            fullWidth
            size="small"
            label="Password"
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            sx={textFieldSx}
          />

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-bold text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loginMutation.isPending || lockoutSecondsLeft > 0}
            sx={{
              height: 46,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 900,
              boxShadow: "none",
            }}
          >
            {loginMutation.isPending
              ? "Signing in..."
              : lockoutSecondsLeft > 0
                ? `Locked (${formatRemainingTime(lockoutSecondsLeft)})`
                : "Sign In"}
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Or
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <SocialLoginButtons />

          <p className="text-center text-xs text-slate-500">
            Do not have an account?{" "}
            <Link
              className="font-semibold text-blue-500 hover:underline"
              to="/register"
            >
              Create account
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
