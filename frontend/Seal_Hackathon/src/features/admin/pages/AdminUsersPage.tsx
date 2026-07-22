import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { Pagination } from "@mui/material";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

import {
  useAdminUsersQuery,
  useDeactivateUserMutation,
  useActivateUserMutation,
} from "@/features/admin/hooks/useAdminMutations";
import { useUserFilters } from "@/features/admin/hooks/useUserFilters";
import { paginationSx } from "@/features/admin/schemas/admin.schema";

import { UserStatCards } from "@/features/admin/components/ManageUserPage/UserStatCards";
import { UserFilterBar } from "@/features/admin/components/ManageUserPage/UserFilterBar";
import { UserViewDialog } from "@/features/admin/components/ManageUserPage/UserViewDialog";
import { UserCreateDialog } from "@/features/admin/components/ManageUserPage/UserCreateDialog";
import { UserEditDialog } from "@/features/admin/components/ManageUserPage/UserEditDialog";
import { UserResetPasswordDialog } from "@/features/admin/components/ManageUserPage/UserResetPasswordDialog";
import { UserProfileGrid } from "@/features/coordinator/components/ManageUserPage/UserProfileGrid";

const PAGE_SIZE = 20;

export function AdminUsersPage() {
  const { search, role, status, page, setSearch, setRole, setStatus, setPage } =
    useUserFilters();

  const [showCreate, setShowCreate] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const { data, isLoading } = useAdminUsersQuery({
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // Stat card queries - size: 1 to only fetch totalElements
  const { data: adminStats, isLoading: isAdminLoading } = useAdminUsersQuery({
    role: "ADMIN",
    status: "ACTIVE",
    pageSize: 1,
  });
  const { data: studentStats, isLoading: isStudentLoading } =
    useAdminUsersQuery({ role: "STUDENT", pageSize: 1 });
  const { data: mentorStats, isLoading: isMentorLoading } = useAdminUsersQuery({
    role: "MENTOR",
    pageSize: 1,
  });
  const { data: judgeStats, isLoading: isJudgeLoading } = useAdminUsersQuery({
    role: "JUDGE",
    pageSize: 1,
  });
  const { data: coordinatorStats, isLoading: isCoordinatorLoading } =
    useAdminUsersQuery({ role: "COORDINATOR", pageSize: 1 });

  const isStatsLoading =
    isAdminLoading ||
    isStudentLoading ||
    isMentorLoading ||
    isJudgeLoading ||
    isCoordinatorLoading;

  const deactivateMutation = useDeactivateUserMutation();
  const activateMutation = useActivateUserMutation();

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
              Administration Workspace
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              <PeopleAltOutlinedIcon
                sx={{ fontSize: 34 }}
                className="text-blue-300"
              />
              People{" "}
              <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Directory
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-400 sm:text-base">
              Manage every account, role and permission across the platform —{" "}
              <span className="font-bold text-slate-200 tabular-nums">
                {total}
              </span>{" "}
              users in total.
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

      <UserStatCards
        adminStats={adminStats}
        studentStats={studentStats}
        mentorStats={mentorStats}
        judgeStats={judgeStats}
        coordinatorStats={coordinatorStats}
        isLoading={isStatsLoading}
      />

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
      <UserCreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <UserEditDialog userId={editUserId} onClose={() => setEditUserId(null)} />
      <UserResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
      />
    </div>
  );
}
