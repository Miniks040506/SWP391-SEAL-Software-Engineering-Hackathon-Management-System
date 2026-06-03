import { Button, Card, CardContent, Skeleton } from "@mui/material";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useNavigate } from "react-router-dom";
import type { PendingRequest } from "@/types/user.types";

function getPendingBadgeStyle(type: PendingRequest["type"]) {
  switch (type) {
    case "STUDENT_REGISTRATION":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "ROLE_UPGRADE":
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  }
}

export function DashboardPendingUsers({
  pendingRequests,
  isLoading,
}: {
  pendingRequests: PendingRequest[];
  isLoading?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      className="border-slate-100 dark:border-slate-700 bg-white! dark:bg-slate-800! shadow-sm rounded-xl h-full"
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
              Pending Users
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Users waiting for approval. Read-only view.
            </p>
          </div>
          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
            className="text-slate-500! dark:text-slate-400! hover:bg-slate-50! dark:hover:bg-slate-700/50! font-semibold! normal-case! tracking-normal!"
            onClick={() => navigate("/admin/users?status=PENDING_APPROVAL")}
          >
            Manage Users
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          {isLoading ? (
            // Skeleton rows while fetching
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
              >
                <div>
                  <Skeleton variant="text" width={160} height={20} />
                  <Skeleton variant="text" width={110} height={16} className="mt-1" />
                </div>
                <Skeleton variant="rounded" width={90} height={22} />
              </div>
            ))
          ) : pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
              No pending users. You're all caught up!
            </div>
          ) : (
            pendingRequests.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${
                  index !== pendingRequests.length - 1
                    ? "border-b border-slate-100 dark:border-slate-700/50"
                    : ""
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
                    Submitted on {item.submittedAt}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-sm text-[10px] font-extrabold uppercase tracking-widest shrink-0 ${getPendingBadgeStyle(item.type)}`}
                >
                  {item.type.replace("_", " ")}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}