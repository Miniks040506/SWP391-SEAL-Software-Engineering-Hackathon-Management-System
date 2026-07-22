import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonIcon from "@mui/icons-material/Person";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";

import { useAdminUserQuery } from "@/features/admin/hooks/useAdminMutations";
import { RoleBadge, StatusDot } from "./UserBadges";
import type { UserRole } from "@/types/auth.types";
import type { UserDetailResponse, UserStatus } from "@/types/user.types";

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

/**
 * The detail endpoint can occasionally return a malformed payload (e.g. a
 * server-side serialization error surfaced as a raw string). Guard against it
 * so a bad response degrades into an inline error instead of crashing the whole
 * page through the router error boundary.
 */
function asUserDetail(data: unknown): UserDetailResponse | null {
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id?: unknown }).id;
    if (typeof id === "string") return data as UserDetailResponse;
  }
  return null;
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
  const { data, isLoading } = useAdminUserQuery(userId);

  const user = asUserDetail(data);
  const loadFailed = Boolean(userId) && !isLoading && !user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <Dialog
      open={Boolean(userId)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      classes={{ paper: "bg-white dark:bg-slate-800 dark:text-slate-200" }}
      sx={{ "& .MuiDialog-paper": { backgroundImage: "none" } }}
    >
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100">
        User Profile
        {user && (
          <div className="text-sm font-normal text-slate-500 dark:text-slate-400">{user.email}</div>
        )}
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={28} />
          </div>
        ) : loadFailed ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ReportGmailerrorredOutlinedIcon
              sx={{ fontSize: 40 }}
              className="text-rose-400"
            />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Couldn&apos;t load this profile
              </p>
              <p className="mt-1 text-xs text-slate-400">
                The server returned an unexpected response. Please try again
                later.
              </p>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-4 pt-2">
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

            <Divider className="dark:border-slate-700" />

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
                    ? new Date(user.lastLoginAt).toLocaleString("sv-SE").slice(0, 16)
                    : "Never"
                }
              />
            </div>
          </div>
        ) : null}
      </DialogContent>

      <DialogActions className="gap-2 px-6 pb-4">
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        {user && (
          <>
            <Tooltip title={isAdmin ? "Cannot reset Admin" : ""}>
              <span>
                <Button
                  variant="outlined"
                  disabled={isAdmin}
                  startIcon={<LockResetIcon />}
                  onClick={() => {
                    onResetPassword(user);
                    onClose();
                  }}
                  sx={{ textTransform: "none", borderRadius: "8px" }}
                >
                  Reset Password
                </Button>
              </span>
            </Tooltip>

            <Tooltip title={isAdmin ? "Cannot edit Admin" : ""}>
              <span>
                <Button
                  variant="contained"
                  disabled={isAdmin}
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
              </span>
            </Tooltip>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
