import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonIcon from "@mui/icons-material/Person";

import { useAdminUserQuery } from "@/features/admin/hooks/useAdminMutations";
import { RoleBadge, StatusDot } from "./UserBadges";
import type { UserRole } from "@/types/auth.types";
import type { UserStatus } from "@/types/user.types";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{value}</div>
    </div>
  );
}

export function UserViewDialog({
  userId,
  onClose,
  onEdit,
  onResetPassword,
}: {
  userId: string | null;
  onClose: () => void;
  onEdit: (userId: string) => void;
  onResetPassword: (user: { id: string; email: string }) => void;
}) {
  const { data: user, isLoading } = useAdminUserQuery(userId);

  return (
    <Dialog open={Boolean(userId)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-black text-slate-800">
        User Profile
        {user && (
          <div className="text-sm font-normal text-slate-400">{user.email}</div>
        )}
      </DialogTitle>

      <DialogContent>
        {isLoading || !user ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={28} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-300">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <PersonIcon fontSize="large" />
                )}
              </div>
              <div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {user.fullName}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RoleBadge role={user.role as UserRole} />
                  <StatusDot status={user.status as UserStatus} />
                </div>
              </div>
            </div>

            <Divider />

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phone ?? "—"} />
              <DetailRow
                label="User ID"
                value={
                  <span className="font-mono text-xs">
                    {user.id.slice(0, 8).toUpperCase()}
                  </span>
                }
              />
              <DetailRow
                label="Last Login"
                value={
                  user.lastLoginAt
                    ? new Date(user.lastLoginAt)
                        .toLocaleString("sv-SE")
                        .slice(0, 16)
                    : "Never"
                }
              />
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="gap-2 px-6 pb-4">
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        {user && (
          <>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<LockResetIcon />}
              onClick={() => {
                onResetPassword(user);
                onClose();
              }}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Reset Password
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                onEdit(user.id);
                onClose();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                boxShadow: "none",
              }}
            >
              Edit User
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}