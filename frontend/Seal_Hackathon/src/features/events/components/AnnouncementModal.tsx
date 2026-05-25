import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignIcon from "@mui/icons-material/Campaign";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import type { Announcement } from "@/types/event.types";

const PHASE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  2: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  3: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
};

const getPhaseColor = (phase?: number) =>
  phase ? (PHASE_COLORS[phase] ?? PHASE_COLORS[1]) : null;

interface AnnouncementModalProps {
  announcement: Announcement;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const AnnouncementModal = ({
  announcement,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: AnnouncementModalProps) => {
  const phaseColor = getPhaseColor(announcement.phase);

  return (
    /*
      Use w-screen/h-screen instead of inset-0 so the overlay fills the
      viewport even when an ancestor has transform or overflow-hidden applied.
    */
    <div
      className="fixed left-0 top-0 z-[999] w-screen h-screen flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Colored top accent per phase */}
        {phaseColor && (
          <div
            className={`h-1 w-full ${phaseColor.bg.replace("bg-", "bg-").replace("50", "400")}`}
          />
        )}

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <CampaignIcon
                  style={{ fontSize: 16 }}
                  className="text-blue-500"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block">
                  Announcement
                </span>
                {announcement.phase && phaseColor && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border mt-0.5 ${phaseColor.bg} ${phaseColor.text} ${phaseColor.border}`}>
                    <FlagIcon style={{ fontSize: 10 }} />
                    Phase {announcement.phase}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all -mt-0.5 -mr-0.5">
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-gray-800 text-sm font-semibold leading-relaxed">
              {announcement.text}
            </p>
            {announcement.detail && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-500 leading-relaxed font-medium whitespace-pre-line">
                {announcement.detail}
              </div>
            )}
          </div>

          {/* Footer: date + prev/next navigation */}
          <div className="pt-4 border-t border-gray-50 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
              <CalendarTodayIcon style={{ fontSize: 12 }} />
              {announcement.date}
            </div>

            {total > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={onPrev}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ArrowBackIcon style={{ fontSize: 13 }} /> Next
                </button>
                <span className="text-xs text-gray-400 font-semibold tabular-nums">
                  {index + 1} / {total}
                </span>
                <button
                  onClick={onNext}
                  disabled={index === total - 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  Previous <ArrowForwardIcon style={{ fontSize: 13 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
