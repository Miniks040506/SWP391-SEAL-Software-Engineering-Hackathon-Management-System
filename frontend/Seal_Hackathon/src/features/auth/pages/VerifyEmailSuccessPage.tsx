import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { RegistrationShell } from "@/features/auth/components/RegistrationShell";

export function VerifyEmailSuccessPage() {
  const navigate = useNavigate();

  return (
    <RegistrationShell currentStep={3}>
      <div className="text-center">
        <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          Step 3 of 3 · Complete
        </span>

        <div className="relative mx-auto mt-8 h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-[0_16px_32px_rgba(16,185,129,0.35)]">
            <MarkEmailReadIcon sx={{ fontSize: 40 }} />
          </div>
        </div>

        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          You're all set!
        </h2>

        <p className="mx-auto mt-3 max-w-105 text-base leading-7 text-slate-500 dark:text-slate-400">
          Your email has been confirmed and your account is now active. Sign
          in to build your team and join the next hackathon season.
        </p>

        <Button
          type="button"
          fullWidth
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            mt: 5,
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
          }}
        >
          Go to Log In
        </Button>

        <p className="mt-6 inline-flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} className="text-amber-500" />
          <span>
            Curious what's coming?{" "}
            <Link
              to="/events"
              className="font-bold text-blue-500 transition-colors hover:text-blue-600 hover:underline"
            >
              Browse upcoming events
            </Link>
          </span>
        </p>
      </div>
    </RegistrationShell>
  );
}
