import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CampaignIcon from "@mui/icons-material/Campaign";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import { getPhaseColor } from "@/features/events/components/PhaseBadge";
import type { PublicAnnouncementView } from "@/features/events/utils/publicEventView";

type AnnouncementModalProps = {
  announcement: PublicAnnouncementView;
  index: number;
  total: number;
  showBackButton?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
};

export function AnnouncementModal({
  announcement,
  index,
  total,
  showBackButton = false,
  onClose,
  onPrev,
  onNext,
  onBack,
}: AnnouncementModalProps) {
  const phaseColor = getPhaseColor(announcement.phase);

  return (
    <div
      className="fixed left-0 top-0 z-999 flex h-screen w-screen items-center justify-center bg-black/50 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-6 p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {showBackButton && (
                <button
                  type="button"
                  onClick={onBack}
                  className="-ml-2 mt-1 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                  title="Back to all announcements"
                >
                  <ArrowBackIcon style={{ fontSize: 20 }} />
                </button>
              )}

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <CampaignIcon style={{ fontSize: 18 }} className="text-blue-500" />
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                    System Announcement
                  </span>

                  {announcement.phase && phaseColor && (
                    <span
                      className={[
                        "mt-1.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
                        "text-[11px] font-bold uppercase tracking-wider",
                        phaseColor.bg,
                        phaseColor.text,
                        phaseColor.border,
                      ].join(" ")}
                    >
                      <FlagIcon style={{ fontSize: 10 }} />
                      Phase {announcement.phase}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="-mr-0.5 -mt-0.5 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
            >
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold leading-snug tracking-tight text-gray-900">
              {announcement.title}
            </h3>

            {announcement.detail && (
              <div
                className={[
                  "whitespace-pre-line rounded-r-xl border-l-4 p-4 text-sm font-medium leading-relaxed text-gray-600",
                  phaseColor ? phaseColor.accent : "border-blue-500",
                  phaseColor ? phaseColor.bg : "bg-gray-50",
                ].join(" ")}
              >
                {announcement.detail}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
              <CalendarTodayIcon style={{ fontSize: 12 }} />
              {announcement.date}
            </div>

            {total > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowBackIcon style={{ fontSize: 13 }} />
                  Previous
                </button>

                <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-bold tabular-nums text-gray-400">
                  {index + 1} / {total}
                </span>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={index === total - 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ArrowForwardIcon style={{ fontSize: 13 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}