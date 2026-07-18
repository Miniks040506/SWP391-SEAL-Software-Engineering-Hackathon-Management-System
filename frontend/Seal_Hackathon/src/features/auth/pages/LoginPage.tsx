import { zodResolver } from "@hookform/resolvers/zod";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { Alert, Button, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButton";
import { useLoginMutation } from "@/features/auth/hooks/useAuthMutations";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import type {
  AuthErrorResponse,
  AuthLockoutErrorResponse,
} from "@/types/auth.types";
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
    backgroundColor: "#f8fafc",
    ".dark &": {
      backgroundColor: "rgba(15,23,42,0.55)",
    },
    "& fieldset": {
      borderColor: "#e2e8f0",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3b82f6",
      borderWidth: "2px",
    },
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

const BRAND_FEATURES = [
  {
    icon: <CodeOutlinedIcon sx={{ fontSize: 22 }} />,
    title: "Submit & iterate",
    description: "Push your repo, upload evidence, and track every round deadline.",
  },
  {
    icon: <InsightsOutlinedIcon sx={{ fontSize: 22 }} />,
    title: "Transparent scoring",
    description: "Criterion-level score breakdowns from internal and guest judges.",
  },
  {
    icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 22 }} />,
    title: "Climb the leaderboard",
    description: "Live standings across Preliminary and Final rounds, every season.",
  },
];

const BRAND_STATS = [
  { value: "3", label: "Seasons / year" },
  { value: "5+", label: "Tracks per event" },
  { value: "100+", label: "Competing teams" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLoginMutation();
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const [lockout, setLockout] = useState<LoginLockoutState | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const oauthError = useMemo(() => searchParams.get("oauthError"), [searchParams]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

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
    const normalizedEmail = values.email.trim().toLowerCase();

    try {
      await loginMutation.mutateAsync({
        email: normalizedEmail,
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
      const errorPayload = error?.response?.data as AuthErrorResponse | undefined;

      if (errorPayload?.code === "ACCOUNT_UNVERIFIED") {
        setLockout(null);
        enqueueSnackbar("Please verify your account. You can resend the code below.", {
          variant: "warning",
        });
        navigate(
          `/verify-email?email=${encodeURIComponent(normalizedEmail)}&mode=login`,
        );
        return;
      }

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
    <div className="relative min-h-dvh overflow-hidden bg-white font-sans text-slate-900 dark:bg-[#020617] dark:text-slate-100">
      {/* ── Diagonal brand background layers ─────────────────────────── */}
      {/* Echo stripe behind the main panel to give the slanted edge depth */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-[60%] bg-blue-500/25 [clip-path:polygon(0_0,100%_0,80%_100%,0_100%)] lg:block dark:bg-blue-500/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 [clip-path:polygon(0_0,100%_0,78%_100%,0_100%)] lg:block dark:from-blue-900 dark:via-indigo-950 dark:to-slate-950"
      >
        {/* Subtle blueprint grid */}
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]" />

        {/* Glow blobs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-105 w-105 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/15" />

        {/* Slanted accent stripes echoing the diagonal edge */}
        <div className="absolute inset-y-[-10%] right-[18%] w-24 -skew-x-12 bg-white/5" />
        <div className="absolute inset-y-[-10%] right-[8%] w-10 -skew-x-12 bg-white/10" />
      </div>

      {/* ── Content grid ─────────────────────────────────────────────── */}
      <div className="relative grid min-h-dvh lg:grid-cols-2">
        {/* Left — brand showcase */}
        <div className="hidden flex-col justify-between px-14 py-12 text-white lg:flex xl:px-20">
          <Link to="/" className="group flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl font-bold text-white shadow-lg ring-1 ring-white/25 backdrop-blur-sm transition-transform group-hover:rotate-3">
              S
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-bold italic tracking-tighter">SEAL</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-100/80">
                Hackathon System
              </span>
            </div>
          </Link>

          <div className="max-w-115">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-100 ring-1 ring-white/20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              FPT University HCM · PDP
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight">
              Build. Compete.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Rise together.
              </span>
            </h1>

            <p className="mt-5 max-w-100 text-base leading-7 text-blue-100/90">
              The official platform for the Software Engineering Hackathon —
              manage your team, submit your work, and follow the results in real
              time.
            </p>

            <ul className="mt-10 space-y-5">
              {BRAND_FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-200 ring-1 ring-white/20 backdrop-blur-sm">
                    {feature.icon}
                  </span>
                  <div>
                    <p className="font-bold">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-blue-100/80">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex max-w-105 items-center gap-8">
            {BRAND_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-blue-100/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — sign-in form */}
        <div className="flex flex-col px-6 py-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 lg:invisible"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                S
              </div>
              <span className="text-lg font-bold italic tracking-tighter">SEAL</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-105">
              <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                Sign in
              </span>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
                Sign in to continue managing your SEAL Hackathon workspace.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
                  label="Email"
                  placeholder="alex.n@fpt.edu.vn"
                  {...register("email")}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  sx={textFieldSx}
                />

                <PasswordField
                  fullWidth
                  label="Password"
                  {...register("password")}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  sx={textFieldSx}
                />

                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
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
                  }}
                >
                  {loginMutation.isPending
                    ? "Signing in..."
                    : lockoutSecondsLeft > 0
                      ? `Locked (${formatRemainingTime(lockoutSecondsLeft)})`
                      : "Sign In"}
                </Button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Or continue with
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <SocialLoginButtons />

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Do not have an account?{" "}
                  <Link
                    className="font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
                    to="/register"
                  >
                    Create account
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pb-2 text-xs text-slate-400 dark:text-slate-500">
            <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
            <span>© 2026 SEAL League Portal · FPT University HCM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
