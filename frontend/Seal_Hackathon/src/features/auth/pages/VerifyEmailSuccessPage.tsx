import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { StepProgress } from "@/features/auth/components/StepProgress";

const steps = [
  { label: "Registration" },
  { label: "Verification" },
  { label: "Success" },
];

export function VerifyEmailSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-155 py-16">
      <StepProgress
        title="Registration Progress"
        currentStep={3}
        steps={steps}
      />

      <AuthCard title="Email Verified Successfully" className="text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_12px_24px_rgba(59,130,246,0.25)]">
          <MarkEmailReadIcon sx={{ fontSize: 32 }} />
        </div>

        <p className="mx-auto max-w-107.5 text-base leading-7 text-slate-600">
          Your email has been confirmed.
        </p>

        <p className="mx-auto mt-1 max-w-107.5 text-base leading-7 text-slate-600">
          Your account is now waiting for coordinator approval.
        </p>

        <Button
          type="button"
          fullWidth
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            mt: 5,
            height: 46,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 900,
            boxShadow: "none",
          }}
        >
          Go to Log In
        </Button>
      </AuthCard>
    </div>
  );
}
