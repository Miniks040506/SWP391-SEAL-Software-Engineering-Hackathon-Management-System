import {
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { FinalAdvancementStatus } from "@/types/advancement.types";

interface TeamAdvancementStatusBannerProps {
  status: FinalAdvancementStatus;
  message: string;
  nextRoundId?: string | null;
  nextRoundName?: string | null;
  canAccessNextRound: boolean;
  eventId: string;
}

export function TeamAdvancementStatusBanner({
  status,
  message,
  nextRoundId,
  nextRoundName,
  canAccessNextRound,
  eventId,
}: TeamAdvancementStatusBannerProps) {
  const navigate = useNavigate();

  const config = {
    WAITING: {
      title: "Advancement pending",
      eyebrow: "Awaiting decision",
      icon: <HourglassEmptyOutlined style={{ fontSize: 28 }} />,
      tone: "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
      iconTone:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      fallback: "Your result for this round has not been confirmed yet.",
    },
    ELIMINATED: {
      title: "This run ends here",
      eyebrow: "Not advanced",
      icon: <CancelOutlined style={{ fontSize: 28 }} />,
      tone: "border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100",
      iconTone:
        "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      fallback: "Your team cannot submit deliverables for later rounds.",
    },
    ADVANCED: {
      title: "Advanced to the next round",
      eyebrow: "Decision confirmed",
      icon: <CheckCircleOutlined style={{ fontSize: 28 }} />,
      tone: "border-blue-200 bg-blue-50/80 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100",
      iconTone:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      fallback: canAccessNextRound
        ? "Your team is eligible for the next round."
        : "Your team is eligible once the next round opens.",
    },
  }[status];

  if (!config) return null;

  return (
    <section
      className={`mb-6 overflow-hidden rounded-[1.5rem] border ${config.tone}`}
    >
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${config.iconTone}`}
          >
            {config.icon}
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
              {config.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              {config.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">
              {message || config.fallback}
            </p>
          </div>
        </div>

        {status === "ADVANCED" && canAccessNextRound && nextRoundId && (
          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}/competing`)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:translate-y-0"
          >
            {nextRoundName ? `Open ${nextRoundName}` : "Open next round"}
            <ArrowForwardOutlined style={{ fontSize: 18 }} />
          </button>
        )}
      </div>
    </section>
  );
}
