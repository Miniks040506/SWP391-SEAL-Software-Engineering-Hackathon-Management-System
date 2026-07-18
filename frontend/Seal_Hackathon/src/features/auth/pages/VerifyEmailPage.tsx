import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Button, CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CodeInput } from "@/features/auth/components/CodeInput";
import { RegistrationShell } from "@/features/auth/components/RegistrationShell";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/features/auth/hooks/useAuthMutations";

type VerifyStatus = "input" | "error";

const secondaryButtonSx = {
  height: 46,
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 750,
  color: "#334155",
  borderColor: "#dbe3ef",
  backgroundColor: "#ffffff",
  boxShadow: "none",
  ".dark &": {
    color: "#e2e8f0",
    borderColor: "#334155",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  "&:hover": {
    color: "#2563eb",
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
    ".dark &": {
      backgroundColor: "rgba(30,58,138,0.25)",
    },
  },
  "&.Mui-disabled": {
    ".dark &": {
      color: "#64748b",
      borderColor: "#1e293b",
    },
  },
};

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("input");

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const isLoading = verifyMutation.isPending || resendMutation.isPending;

  const pageState = useMemo(() => {
    if (status === "error") {
      return {
        title: "Verification Error",
        description: "Invalid verification code. Please try again.",
        icon: <ReportGmailerrorredIcon sx={{ fontSize: 34 }} />,
        iconClass:
          "bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_16px_32px_rgba(244,63,94,0.35)]",
      };
    }

    return {
      title: "Check your inbox",
      description:
        "Please check your inbox and enter the verification code below to verify your email address.",
      icon: <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 34 }} />,
      iconClass:
        "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_16px_32px_rgba(59,130,246,0.35)]",
    };
  }, [status]);

  const handleVerify = async (nextCode: string) => {
    if (verifyMutation.isPending) return;

    if (!email) {
      enqueueSnackbar("Missing email. Please register again.", {
        variant: "error",
      });

      navigate("/register");
      return;
    }

    if (nextCode.length !== 6) return;

    try {
      await verifyMutation.mutateAsync({
        email,
        code: nextCode,
      });

      enqueueSnackbar("Email verified successfully.", {
        variant: "success",
      });

      navigate("/verify-email/success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setStatus("error");

      enqueueSnackbar(error?.response?.data?.message || "Invalid verification code.", {
        variant: "error",
      });
    }
  };

  const handleCodeChange = (nextCode: string) => {
    const cleaned = nextCode.replace(/\D/g, "").slice(0, 6);

    setCode(cleaned);

    if (status === "error") {
      setStatus("input");
    }

    if (cleaned.length === 6) {
      void handleVerify(cleaned);
    }
  };

  const handleResend = async () => {
    if (!email) {
      enqueueSnackbar("Missing email. Please register again.", {
        variant: "error",
      });

      navigate("/register");
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });

      setStatus("input");
      setCode("");

      enqueueSnackbar("Verification code sent again.", {
        variant: "success",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Cannot resend verification code.", {
        variant: "error",
      });
    }
  };

  return (
    <RegistrationShell currentStep={2}>
      <div className="text-center">
        <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          Step 2 of 3
        </span>

        <div
          className={[
            "mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-2xl text-white transition-colors",
            pageState.iconClass,
          ].join(" ")}
        >
          {pageState.icon}
        </div>

        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          {pageState.title}
        </h2>

        <p className="mx-auto mt-3 max-w-105 text-base leading-7 text-slate-500 dark:text-slate-400">
          A verification code has been sent to{" "}
          <span className="font-bold text-blue-500">
            {email || "your email"}
          </span>
        </p>

        <p
          className={[
            "mx-auto mt-1 max-w-105 text-base leading-7",
            status === "error"
              ? "font-semibold text-rose-500"
              : "text-slate-500 dark:text-slate-400",
          ].join(" ")}
        >
          {pageState.description}
        </p>

        <div className="mt-8">
          <CodeInput
            value={code}
            onChange={handleCodeChange}
            error={status === "error"}
            disabled={verifyMutation.isPending}
          />
        </div>

        <div className="mt-6 text-sm font-bold text-slate-500 dark:text-slate-400">
          {verifyMutation.isPending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <CircularProgress size={14} />
              Verifying code...
            </span>
          ) : (
            "Enter the 6-digit code from your email."
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/register")}
            sx={secondaryButtonSx}
          >
            Change email
          </Button>

          <Button
            type="button"
            variant="outlined"
            startIcon={<RestartAltIcon />}
            disabled={isLoading}
            onClick={handleResend}
            sx={secondaryButtonSx}
          >
            {resendMutation.isPending ? "Resending..." : "Resend code"}
          </Button>
        </div>
      </div>
    </RegistrationShell>
  );
}
