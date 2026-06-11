import { getSubmissionStatusColor } from "../schemas/submissions.schema";

type Props = {
  status: string;
  size?: "sm" | "md";
};

export function SubmissionStatusBadge({ status, size = "md" }: Props) {
  const colorClass = getSubmissionStatusColor(status);
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center font-bold rounded-lg border ${colorClass} ${sizeClass}`}>
      {status}
    </span>
  );
}