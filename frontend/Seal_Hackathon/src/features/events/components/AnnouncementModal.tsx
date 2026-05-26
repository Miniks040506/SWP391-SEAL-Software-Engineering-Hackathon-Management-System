import React from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignIcon from "@mui/icons-material/Campaign";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import { getPhaseColor } from "../common/PhaseBadge";
import type { Announcement } from "@/types/event.types";

interface AnnouncementModalProps {
  announcement: Announcement;
  index: number;
  total: number;
  showBackButton?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const AnnouncementModal = ({
  announcement,
  index,
  total,
  showBackButton = false,
  onClose,
  onPrev,
  onNext,
  onBack,
}: AnnouncementModalProps) => {
  const phaseColor = getPhaseColor(announcement.phase);

  return (
    <div
      className="fixed left-0 top-0 z-[999] w-screen h-screen flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="mt-1 p-1.5 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                  title="Back to all announcements"
                >
                  <ArrowBackIcon style={{ fontSize: 20 }} />
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <CampaignIcon style={{ fontSize: 18 }} className="text-blue-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    System Announcement
                  </span>
                  {announcement.phase && phaseColor && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mt-1.5 ${phaseColor.bg} ${phaseColor.text} ${phaseColor.border}`}
                    >
                      <FlagIcon style={{ fontSize: 10 }} />
                      Phase {announcement.phase}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all -mt-0.5 -mr-0.5"
            >
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 leading-snug tracking-tight">
              {announcement.text}
            </h3>
            {announcement.detail && (
              <div
                className={`border-l-4 ${phaseColor ? phaseColor.accent : "border-blue-500"} ${
                  phaseColor ? phaseColor.bg : "bg-gray-50"
                } rounded-r-xl p-4 text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line`}
              >
                {announcement.detail}
              </div>
            )}
          </div>

          {/* Footer: date + prev/next navigation */}
          <div className="pt-5 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
              <CalendarTodayIcon style={{ fontSize: 12 }} />
              {announcement.date}
            </div>

            {total > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onPrev}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowBackIcon style={{ fontSize: 13 }} /> Previous
                </button>
                <span className="text-xs text-gray-400 font-bold tabular-nums bg-gray-50 px-2.5 py-1 rounded-md">
                  {index + 1} / {total}
                </span>
                <button
                  onClick={onNext}
                  disabled={index === total - 1}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next <ArrowForwardIcon style={{ fontSize: 13 }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};