import { Button, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
import { UserFilterBar } from "@/features/admin/components/AdminDashboard/UserFilterBar";
import { UserTable } from "@/features/admin/components/AdminDashboard/UserTable";
import { UserViewDialog } from "@/features/admin/components/ManageUserPage/UserViewDialog";
import { UserCreateDialog } from "@/features/admin/components/ManageUserPage/UserCreateDialog";
import { UserEditDialog } from "@/features/admin/components/ManageUserPage/UserEditDialog";
import { UserResetPasswordDialog } from "@/features/admin/components/ManageUserPage/UserResetPasswordDialog";

const PAGE_SIZE = 10;

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
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Manage Users & Permissions
          </h1>
          <p className="text-sm text-slate-400">{total} users total</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Create New User
        </Button>
      </div>

      <UserStatCards
        adminStats={adminStats}
        studentStats={studentStats}
        mentorStats={mentorStats}
        judgeStats={judgeStats}
        coordinatorStats={coordinatorStats}
        isLoading={isStatsLoading}
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <UserFilterBar
          search={search}
          role={role}
          status={status}
          onSearchChange={setSearch}
          onRoleChange={setRole}
          onStatusChange={setStatus}
        />

        <UserTable
          users={users}
          isLoading={isLoading}
          isMutating={isMutating}
          onView={setViewUserId}
          onEdit={setEditUserId}
          onResetPassword={setResetUser}
          onToggleStatus={handleToggleStatus}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3">
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
