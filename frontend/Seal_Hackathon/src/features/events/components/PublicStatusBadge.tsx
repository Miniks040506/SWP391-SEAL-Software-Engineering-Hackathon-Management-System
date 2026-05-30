import {
  getDisplayStatus,
  getStatusBadgeClass,
} from "@/features/events/utils/publicEventView";

type PublicStatusBadgeProps = {
  status?: string | null;
};

export function PublicStatusBadge({ status }: PublicStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-xs font-black uppercase tracking-widest",
        getStatusBadgeClass(status),
      ].join(" ")}
    >
      {getDisplayStatus(status)}
    </span>
  );
}