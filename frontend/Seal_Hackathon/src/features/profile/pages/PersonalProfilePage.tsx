import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import { PasswordField } from "@/features/auth/components/PasswordField";
import { AvatarUploadCard } from "@/features/profile/components/AvatarUploadCard";
import {
  useChangeMyPasswordMutation,
  useUpdateMyProfileMutation,
} from "@/features/profile/hooks/useProfileMutations";
import { useMyProfileQuery } from "@/features/profile/hooks/useProfileQueries";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
  updateMyProfileSchema,
  type UpdateMyProfileFormValues,
} from "@/features/profile/schemas/profile.schema";
import { useAuthStore } from "@/stores/authStore";
import { dividerSx, infoAlertSx, tabsSx, textFieldSx } from "../utils/componentSx";

function getInitialLetter(fullName?: string | null, email?: string | null) {
  const source = fullName || email || "U";
  return source.charAt(0).toUpperCase();
}

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message;
  return typeof responseMessage === "string" ? responseMessage : fallback;
}

export function PersonalProfilePage() {
  const navigate = useNavigate();

  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [tab, setTab] = useState(0);

  const profileQuery = useMyProfileQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const changePasswordMutation = useChangeMyPasswordMutation();

  const profileForm = useForm<UpdateMyProfileFormValues>({
    resolver: zodResolver(updateMyProfileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      avatarUrl: "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    profileForm.reset({
      fullName: profileQuery.data.fullName || "",
      phone: profileQuery.data.phone || "",
      avatarUrl: profileQuery.data.avatarUrl || "",
    });
  }, [profileQuery.data, profileForm]);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: "/personal" }} />;
  }

  const onUpdateProfile = async (values: UpdateMyProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync({
        fullName: values.fullName.trim(),
        phone: normalizeOptional(values.phone),
        avatarUrl: normalizeOptional(values.avatarUrl),
      });

      enqueueSnackbar("Profile updated successfully.", { variant: "success" });
    } catch (error: unknown) {
      enqueueSnackbar(getRequestErrorMessage(error, "Update profile failed."), {
        variant: "error",
      });
    }
  };

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      enqueueSnackbar("Password changed successfully. Please sign in again.", {
        variant: "success",
      });

      passwordForm.reset();
      clearAuth();

      navigate("/login", { replace: true });
    } catch (error: unknown) {
      enqueueSnackbar(getRequestErrorMessage(error, "Change password failed."), {
        variant: "error",
      });
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-label="Loading profile">
        <div className="h-64 rounded-[28px] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-80 rounded-[28px] bg-slate-200 dark:bg-slate-800 lg:col-span-4" />
          <div className="h-112 rounded-[28px] bg-slate-200 dark:bg-slate-800 lg:col-span-8" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl rounded-[28px] border border-rose-200 bg-rose-50 p-8 dark:border-rose-900/60 dark:bg-rose-950/30">
        <Alert severity="error" sx={{ background: "transparent", p: 0 }}>
          Cannot load your profile. Please sign in again.
        </Alert>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_90%_100%,rgba(14,165,233,0.12),transparent_30%)]" />
        <div className="relative grid gap-8 px-6 py-7 sm:px-10 sm:py-9 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="flex min-w-0 items-center gap-5 sm:gap-7">
            <Avatar
              src={profile.avatarUrl || ""}
              alt={profile.fullName}
              sx={{
                width: { xs: 84, sm: 112 },
                height: { xs: 84, sm: 112 },
                flexShrink: 0,
                border: "4px solid rgba(255,255,255,0.86)",
                bgcolor: "#2563eb",
                fontSize: { xs: 30, sm: 42 },
                fontWeight: 800,
                boxShadow: "0 18px 36px rgba(15, 23, 42, 0.2)",
              }}
            >
              {getInitialLetter(profile.fullName, profile.email)}
            </Avatar>
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                Personal profile
              </p>
              <h1 className="wrap-break-word text-3xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
                {profile.fullName}
              </h1>
              <div className="mt-3 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex max-w-full items-center gap-2 break-all">
                  <EmailOutlinedIcon sx={{ fontSize: 17 }} />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircleOutlinedIcon sx={{ fontSize: 17 }} />
                  {profile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-sm sm:justify-self-end lg:w-full">
            <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/35">
              <BadgeOutlinedIcon className="text-blue-600 dark:text-blue-300" sx={{ fontSize: 20 }} />
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Role</p>
              <p className="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">{profile.role}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/35">
              <PhoneOutlinedIcon className="text-blue-600 dark:text-blue-300" sx={{ fontSize: 20 }} />
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Phone</p>
              <p className="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">{profile.phone || "Not added"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AvatarUploadCard profile={profile} />
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 sm:p-7 lg:col-span-8">
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Account settings</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep your contact details current for event updates.</p>
            </div>
            <Button
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(-1)}
              sx={{
                minWidth: "auto",
                flexShrink: 0,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 800,
                color: "#64748b",
              }}
            >
              Back
            </Button>
          </div>

          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={tabsSx}
          >
            <Tab
              icon={<PersonOutlineOutlinedIcon />}
              iconPosition="start"
              label="Profile details"
            />

            <Tab
              icon={<LockResetOutlinedIcon />}
              iconPosition="start"
              label="Password"
            />
          </Tabs>

          <Divider sx={dividerSx} />

          {tab === 0 && (
            <form
              onSubmit={profileForm.handleSubmit(onUpdateProfile)}
              className="space-y-5"
            >
              <Controller
                name="fullName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full name"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    sx={textFieldSx}
                  />
                )}
              />

              <TextField fullWidth label="Email" value={profile.email} disabled sx={textFieldSx} />

              <Controller
                name="phone"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                    placeholder="0983177453"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    sx={textFieldSx}
                  />
                )}
              />

              <Controller
                name="avatarUrl"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Avatar URL"
                    disabled
                    error={Boolean(fieldState.error)}
                    helperText={
                      fieldState.error?.message ||
                      "This URL is updated automatically after backend uploads the image to Cloudinary."
                    }
                    sx={textFieldSx}
                  />
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField fullWidth label="Role" value={profile.role} disabled sx={textFieldSx} />
                <TextField fullWidth label="Status" value={profile.status} disabled sx={textFieldSx} />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">Changes are saved to your account immediately.</p>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateProfileMutation.isPending}
                  startIcon={<SaveOutlinedIcon />}
                  sx={{
                    height: 44,
                    borderRadius: "11px",
                    px: 4,
                    textTransform: "none",
                    fontWeight: 900,
                    boxShadow: "none",
                  }}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          )}

          {tab === 1 && (
            <form
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
              className="space-y-5"
            >
              <Alert severity="info" sx={infoAlertSx}>
                After changing password, you should sign in again.
              </Alert>
            
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    {...field}
                    fullWidth
                    label="Current password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    sx={textFieldSx}
                  />
                )}
              />

              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    {...field}
                    fullWidth
                    label="New password"
                    error={Boolean(fieldState.error)}
                    helperText={
                      fieldState.error?.message ||
                      "At least 8 characters, including one letter and one digit."
                    }
                    sx={textFieldSx}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    {...field}
                    fullWidth
                    label="Confirm new password"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    sx={textFieldSx}
                  />
                )}
              />

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">You will be signed out after a successful password change.</p>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={changePasswordMutation.isPending}
                  startIcon={<LockResetOutlinedIcon />}
                  sx={{
                    height: 44,
                    borderRadius: "11px",
                    px: 4,
                    textTransform: "none",
                    fontWeight: 900,
                    boxShadow: "none",
                  }}
                >
                  {changePasswordMutation.isPending ? "Changing..." : "Change password"}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
