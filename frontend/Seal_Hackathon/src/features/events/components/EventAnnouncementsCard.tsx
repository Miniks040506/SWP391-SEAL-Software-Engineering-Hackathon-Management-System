import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CampaignIcon from "@mui/icons-material/Campaign";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PhaseBadge } from "../common/PhaseBadge";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import type { Event } from "@/types/event.types";

const ANNOUNCEMENT_MAX_PREVIEW = 2;

interface EventAnnouncementsCardProps {
  announcements: Event["announcements"];
  onSelect: (index: number) => void;
}

export const EventAnnouncementsCard = ({
  announcements,
  onSelect,
}: EventAnnouncementsCardProps) => {
  const [showAllModal, setShowAllModal] = useState(false);

  useBodyScrollLock(showAllModal);

  if (!announcements || announcements.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <CampaignIcon style={{ fontSize: 18 }} className="text-blue-500" />
          Latest Announcements
        </h3>
        <p className="text-sm text-gray-500 italic text-center py-6">No recent updates.</p>
      </section>
    );
  }

  const previewAnnouncements = announcements.slice(0, ANNOUNCEMENT_MAX_PREVIEW);

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <CampaignIcon style={{ fontSize: 18 }} className="text-blue-500" />
            Announcements
          </h3>
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold tabular-nums">
            {announcements.length}
          </span>
        </div>

        <div className="space-y-3">
          {previewAnnouncements.map((msg, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gray-50/50 border border-gray-200 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 font-medium">{msg.date}</span>
                <PhaseBadge phase={msg.phase} />
              </div>
              <p className="text-sm text-gray-800 font-semibold leading-relaxed line-clamp-2">
                {msg.text}
              </p>
              <button
                onClick={() => onSelect(i)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
              >
                <OpenInNewIcon style={{ fontSize: 12 }} />
                <span>View details</span>
              </button>
            </div>
          ))}
        </div>

        {announcements.length > ANNOUNCEMENT_MAX_PREVIEW && (
          <button
            onClick={() => setShowAllModal(true)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors group"
          >
            View all {announcements.length} announcements
            <ChevronRightIcon
              style={{ fontSize: 14 }}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        )}
      </section>

      {showAllModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <CampaignIcon className="text-blue-500" />
                <h3 className="text-base font-bold text-gray-900">All Event Announcements</h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {announcements.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500">{msg.date}</span>
                      <PhaseBadge phase={msg.phase} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{msg.text}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAllModal(false);
                      onSelect(idx);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
                  >
                    <OpenInNewIcon style={{ fontSize: 12 }} />
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};