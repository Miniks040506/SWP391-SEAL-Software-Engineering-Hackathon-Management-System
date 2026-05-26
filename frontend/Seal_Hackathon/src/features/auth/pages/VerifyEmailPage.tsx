import { useMemo, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { StepProgress } from "@/features/auth/components/StepProgress";
import { CodeInput } from "@/features/auth/components/CodeInput";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/features/auth/hooks/useAuthMutations";

const steps = [
  { label: "Registration" },
  { label: "Verification" },
  { label: "Success" },
];

type VerifyStatus = "input" | "error";

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
        icon: <ReportGmailerrorredIcon sx={{ fontSize: 30 }} />,
      };
    }

    return {
      title: "Email Verification",
      description:
        "Please check your inbox and enter the verification code below to verify your email address.",
      icon: <EmailIcon sx={{ fontSize: 30 }} />,
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
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Cannot resend verification code.", {
        variant: "error",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-155 py-16">
      <StepProgress
        title="Registration Progress"
        currentStep={2}
        steps={steps}
      />

      <AuthCard title={pageState.title} className="text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_12px_24px_rgba(59,130,246,0.25)]">
          {pageState.icon}
        </div>

        <p className="mx-auto max-w-107.5 text-base leading-7 text-slate-600">
          A verification code has been sent to{" "}
          <span className="font-semibold text-blue-500">
            {email || "your email"}
          </span>
        </p>

        <p
          className={[
            "mx-auto mt-2 max-w-107.5 text-base leading-7",
            status === "error" ? "font-semibold text-rose-500" : "text-slate-600",
          ].join(" ")}
        >
          {pageState.description}
        </p>

        <div className="mt-8">
          <CodeInput
            value={code}
            onChange={handleCodeChange}
            error={status === "error"}
          />
        </div>

        <div className="mt-8 text-sm font-extrabold text-slate-600">
          {verifyMutation.isPending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <CircularProgress size={14} />
              Verifying code...
            </span>
          ) : (
            "Enter the 6-digit code from your email."
          )}
        </div>
      </AuthCard>

      <div className="mx-auto mt-8 flex w-full max-w-155 items-center justify-center gap-4">
        <Button
          type="button"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/register")}
          sx={{
            width: 220,
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
          startIcon={<RestartAltIcon />}
          disabled={isLoading}
          onClick={handleResend}
          sx={{
            width: 250,
            height: 42,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 900,
          }}
        >
          {resendMutation.isPending ? "Resending..." : "Resend verification code"}
        </Button>
      </div>
    </div>
  );
}
