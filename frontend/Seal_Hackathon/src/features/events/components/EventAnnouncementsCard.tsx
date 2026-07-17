import { useMemo } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PhaseBadge } from "@/features/events/components/PhaseBadge";
import { useBodyScrollLock } from "@/features/events/hooks/useBodyScrollLock";
import {
  toAnnouncementViews,
  type PublicAnnouncementView,
} from "@/features/events/utils/publicEventView";
import type { AnnouncementResponse } from "@/types/announcement.types";

const ANNOUNCEMENT_MAX_PREVIEW = 2;

type EventAnnouncementsCardProps = {
  announcements: AnnouncementResponse[];
  onSelect: (announcement: PublicAnnouncementView, index: number, fromList?: boolean) => void;
  showAllModal: boolean;
  setShowAllModal: (show: boolean) => void;
};

export function EventAnnouncementsCard({
  announcements,
  onSelect,
  showAllModal,
  setShowAllModal,
}: EventAnnouncementsCardProps) {
  useBodyScrollLock(showAllModal);

  const views = useMemo(() => toAnnouncementViews(announcements), [announcements]);

  if (views.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 pt-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 to-cyan-400" />
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-slate-200">
          <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" />
          Announcements
        </h3>

        <p className="py-6 text-center text-sm italic text-gray-500 dark:text-slate-500">
          No recent updates.
        </p>
      </section>
    );
  }

  const preview = views.slice(0, ANNOUNCEMENT_MAX_PREVIEW);

  return (
    <>
      <section className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 pt-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 to-cyan-400" />
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-slate-200">
            <CampaignIcon style={{ fontSize: 16 }} className="text-blue-500" />
            Announcements
          </h3>

          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
            {views.length}
          </span>
        </div>

        <div className="space-y-3">
          {preview.map((announcement, index) => (
            <div
              key={announcement.id}
              className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-blue-200 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-500/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-500">
                  {announcement.date}
                </span>

                <PhaseBadge phase={announcement.phase} />
              </div>

              <p className="line-clamp-2 text-sm font-semibold leading-relaxed text-gray-800 dark:text-slate-200">
                {announcement.text}
              </p>

              <button
                type="button"
                onClick={() => onSelect(announcement, index, false)}
                className="inline-flex cursor-pointer items-center gap-1 pt-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <OpenInNewIcon style={{ fontSize: 12 }} />
                View details
              </button>
            </div>
          ))}
        </div>

        {views.length > ANNOUNCEMENT_MAX_PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="group flex w-full cursor-pointer items-center justify-center gap-1 py-2 text-xs font-bold text-blue-500 transition-colors hover:text-blue-700 dark:hover:text-blue-400"
          >
            View all {views.length} announcements
            <ChevronRightIcon
              style={{ fontSize: 14 }}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        )}
      </section>

      {showAllModal && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150 dark:border dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <CampaignIcon className="text-blue-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                  All Event Announcements
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {views.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-slate-500">
                        {announcement.date}
                      </span>

                      <PhaseBadge phase={announcement.phase} />
                    </div>

                    <p className="text-sm font-bold leading-snug text-gray-900 dark:text-slate-100">
                      {announcement.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAllModal(false);
                      onSelect(announcement, index, true);
                    }}
                    className="inline-flex cursor-pointer items-center justify-center gap-1 self-start whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 sm:self-center dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
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
}
