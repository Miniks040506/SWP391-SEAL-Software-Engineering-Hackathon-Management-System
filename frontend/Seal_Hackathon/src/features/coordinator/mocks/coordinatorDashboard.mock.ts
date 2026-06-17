import type { SummaryCardType } from "../components/dashboard/DashboardSummaryCards";
import type { PendingActionType } from "../components/dashboard/DashboardPendingActions";
import type { RecentActivityType } from "../components/dashboard/DashboardRecentActivity";
import type { ResultStatusType } from "../components/dashboard/DashboardResultStatus";

export const mockCoordinatorDashboard = {
  summaryCards: [
    { title: "Active Events", value: 1, description: "Currently running or registration open", iconType: "event", color: "bg-blue-50 text-blue-600" },
    { title: "Pending Teams", value: 18, description: "Waiting for approval", iconType: "team", color: "bg-orange-50 text-orange-600" },
    { title: "Submissions", value: 30, description: "Total submissions received", iconType: "submission", color: "bg-purple-50 text-purple-600" },
    { title: "Draft Scorecards", value: 5, description: "Need judge completion", iconType: "grading", color: "bg-rose-50 text-rose-600" },
  ] as SummaryCardType[],
  
  resultStatus: {
    round: "Final Round",
    rankingCalculated: 100,
    awardsAssigned: 80,
    published: 0,
  } as ResultStatusType,
  
  pendingActions: [
    { id: "pa-1", title: "18 team registrations are waiting for approval", description: "Review team members, track selection, and eligibility before approving.", actionLabel: "Review Teams", path: "/coordinator/teams", priority: "High" },
    { id: "pa-2", title: "Preliminary submission deadline has passed", description: "Lock the submission round so judges can start grading.", actionLabel: "Lock Submission", path: "/coordinator/submissions", priority: "High" },
    { id: "pa-3", title: "5 scorecards are still in Draft", description: "Check grading progress before locking round grading.", actionLabel: "View Grading", path: "/coordinator/judging", priority: "Medium" },
    { id: "pa-4", title: "Final results are ready to publish", description: "Review final ranking and awards before publishing results.", actionLabel: "Publish Results", path: "/coordinator/prizes", priority: "High" },
  ] as PendingActionType[],
  
  recentActivities: [
    { id: "ac-1", time: "May 22, 2026 - 10:30", title: "Team registration approved", description: "You approved team Code Warriors for AI Track." },
    { id: "ac-2", time: "May 22, 2026 - 09:15", title: "Judge assigned", description: "You assigned Nguyen Van D to AI Track - Preliminary Round." },
    { id: "ac-3", time: "May 21, 2026 - 16:45", title: "Notification sent", description: "Submission deadline reminder was sent to all approved teams." },
  ] as RecentActivityType[],
};