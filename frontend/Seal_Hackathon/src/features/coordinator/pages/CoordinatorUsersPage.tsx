import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { Pagination, Skeleton } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  useCoordinatorUsersQuery,
  useCoordinatorDeactivateUserMutation,
  useCoordinatorActivateUserMutation,
} from "@/features/coordinator/hooks/useCoordinatorManageUserMutations";
import { useUserFilters } from "@/features/admin/hooks/useUserFilters";
import { paginationSx } from "@/features/admin/schemas/admin.schema";
import { CREATE_ROLES } from "@/features/coordinator/schemas/coordinator.schema";

import { UserFilterBar } from "@/features/admin/components/ManageUserPage/UserFilterBar";
import { UserViewDialog } from "@/features/admin/components/ManageUserPage/UserViewDialog";
import { UserEditDialog } from "@/features/admin/components/ManageUserPage/UserEditDialog";
import { UserResetPasswordDialog } from "@/features/admin/components/ManageUserPage/UserResetPasswordDialog";
import { CoordinatorUserCreateDialog } from "@/features/coordinator/components/ManageUserPage/CoordinatorUserCreateDialog";
import { UserProfileGrid } from "@/features/coordinator/components/ManageUserPage/UserProfileGrid";

const PAGE_SIZE = 20;

function RoleStatCard({
  label,
  count,
  sub,
  icon,
  accent,
  iconWrap,
  isLoading,
}: {
  label: string;
  count: number;
  sub: string;
  icon: ReactNode;
  accent: string;
  iconWrap: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconWrap,
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={["text-[11px] font-bold uppercase tracking-[0.12em]", accent].join(" ")}>
          {label}
        </p>
        <p className="text-2xl font-black leading-tight text-slate-900 tabular-nums dark:text-white">
          {isLoading ? (
            <Skeleton variant="text" width={32} height={32} className="dark:bg-slate-700" />
          ) : (
            count
          )}
        </p>
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

export function CoordinatorUsersPage() {
  const { search, role, status, page, setSearch, setRole, setStatus, setPage } =
    useUserFilters();

  const [showCreate, setShowCreate] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const { data, isLoading } = useCoordinatorUsersQuery({
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: adminStats, isLoading: isAdminLoading } =
    useCoordinatorUsersQuery({ role: "ADMIN", status: "ACTIVE", pageSize: 1 });
  const { data: studentStats, isLoading: isStudentLoading } =
    useCoordinatorUsersQuery({ role: "STUDENT", pageSize: 1 });
  const { data: mentorStats, isLoading: isMentorLoading } =
    useCoordinatorUsersQuery({ role: "MENTOR", pageSize: 1 });
  const { data: judgeStats, isLoading: isJudgeLoading } =
    useCoordinatorUsersQuery({ role: "JUDGE", pageSize: 1 });
  const { data: coordinatorStats, isLoading: isCoordinatorLoading } =
    useCoordinatorUsersQuery({ role: "COORDINATOR", pageSize: 1 });

  const isStatsLoading =
    isAdminLoading ||
    isStudentLoading ||
    isMentorLoading ||
    isJudgeLoading ||
    isCoordinatorLoading;

  const deactivateMutation = useCoordinatorDeactivateUserMutation();
  const activateMutation = useCoordinatorActivateUserMutation();

  const handleToggleStatus = async (user: { id: string; status: string }) => {
    try {
      if (user.status === "ACTIVE") {
        await deactivateMutation.mutateAsync(user.id);
        enqueueSnackbar("User deactivated successfully.", {
          variant: "success",
        });
      } else {
        await activateMutation.mutateAsync(user.id);
        enqueueSnackbar("User activated successfully.", { variant: "success" });
      }
    } catch {
      enqueueSnackbar("Failed to update status.", { variant: "error" });
    }
  };

  const users = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const isMutating = deactivateMutation.isPending || activateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero command header */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
              Coordinator Workspace
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              <PeopleAltOutlinedIcon sx={{ fontSize: 34 }} className="text-blue-300" />
              People{" "}
              <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Directory
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-400 sm:text-base">
              Manage every participant, mentor, judge and coordinator —{" "}
              <span className="font-bold text-slate-200 tabular-nums">{total}</span>{" "}
              accounts in the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <AddOutlinedIcon sx={{ fontSize: 20 }} />
            Create New User
          </button>
        </div>
      </header>

      {/* Role stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <RoleStatCard
          label="Administrators"
          count={adminStats?.totalElements ?? 0}
          sub="Active"
          icon={<AdminPanelSettingsOutlinedIcon className="text-rose-500" />}
          iconWrap="bg-rose-50 dark:bg-rose-500/10"
          accent="text-rose-600 dark:text-rose-400"
          isLoading={isStatsLoading}
        />
        <RoleStatCard
          label="Students"
          count={studentStats?.totalElements ?? 0}
          sub="Registered"
          icon={<SchoolOutlinedIcon className="text-emerald-500" />}
          iconWrap="bg-emerald-50 dark:bg-emerald-500/10"
          accent="text-emerald-600 dark:text-emerald-400"
          isLoading={isStatsLoading}
        />
        <RoleStatCard
          label="Mentors"
          count={mentorStats?.totalElements ?? 0}
          sub="Assigned"
          icon={<SupervisorAccountOutlinedIcon className="text-pink-500" />}
          iconWrap="bg-pink-50 dark:bg-pink-500/10"
          accent="text-pink-600 dark:text-pink-400"
          isLoading={isStatsLoading}
        />
        <RoleStatCard
          label="Judges"
          count={judgeStats?.totalElements ?? 0}
          sub="Invited"
          icon={<GavelOutlinedIcon className="text-amber-500" />}
          iconWrap="bg-amber-50 dark:bg-amber-500/10"
          accent="text-amber-600 dark:text-amber-400"
          isLoading={isStatsLoading}
        />
        <RoleStatCard
          label="Coordinators"
          count={coordinatorStats?.totalElements ?? 0}
          sub="Assigned"
          icon={<WorkspacePremiumOutlinedIcon className="text-violet-500" />}
          iconWrap="bg-violet-50 dark:bg-violet-500/10"
          accent="text-violet-600 dark:text-violet-400"
          isLoading={isStatsLoading}
        />
      </div>

      {/* Directory panel */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
        <UserFilterBar
          search={search}
          role={role}
          status={status}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />

        <UserProfileGrid
          users={users}
          isLoading={isLoading}
          isMutating={isMutating}
          onView={setViewUserId}
          onEdit={setEditUserId}
          onResetPassword={setResetUser}
          onToggleStatus={handleToggleStatus}
          restrictedRoles={CREATE_ROLES}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total} users
            </span>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              shape="rounded"
              variant="outlined"
              sx={paginationSx}
            />
          </div>
        )}
      </div>

      <UserViewDialog
        userId={viewUserId}
        onClose={() => setViewUserId(null)}
        onEdit={setEditUserId}
        onResetPassword={setResetUser}
      />
      <CoordinatorUserCreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <UserEditDialog
        userId={editUserId}
        onClose={() => setEditUserId(null)}
        availableRoles={CREATE_ROLES}
      />
      <UserResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}
