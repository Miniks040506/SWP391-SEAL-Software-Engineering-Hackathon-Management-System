import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
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

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

function getInitialLetter(fullName?: string | null, email?: string | null) {
  const source = fullName || email || "U";
  return source.charAt(0).toUpperCase();
}

function normalizeNullable(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
        phone: normalizeNullable(values.phone),
        avatarUrl: normalizeNullable(values.avatarUrl),
      });

      enqueueSnackbar("Profile updated successfully.", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Update profile failed.", {
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
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Change password failed.", {
        variant: "error",
      });
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert severity="error">Cannot load your profile. Please sign in again.</Alert>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Cover */}
        <div className="relative h-44 bg-linear-to-r from-blue-500 via-sky-400 to-violet-600">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[22px_22px]" />
        </div>

        {/* Profile summary */}
        <div className="relative px-8 pb-8 pt-20 sm:px-10 sm:pt-7">
          {/* Avatar absolute, không còn đẩy layout bị lệch */}
          <Avatar
            src={profile.avatarUrl || ""}
            alt={profile.fullName}
            sx={{
              position: "absolute",
              left: {
                xs: 32,
                sm: 40,
              },
              top: -72,
              width: 128,
              height: 128,
              border: "6px solid white",
              bgcolor: "#3b82f6",
              fontSize: 44,
              fontWeight: 900,
              boxShadow: "0 22px 48px rgba(15, 23, 42, 0.22)",
            }}
          >
            {getInitialLetter(profile.fullName, profile.email)}
          </Avatar>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Chừa khoảng bên trái cho avatar ở desktop */}
            <div className="min-w-0 sm:pl-40">
              <h1 className="break-words text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {profile.fullName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
                <span className="inline-flex max-w-full items-center gap-1.5 break-all">
                  <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                  {profile.email}
                </span>

                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  {profile.role}
                </span>

                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {profile.status}
                </span>
              </div>
            </div>

            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  sm: "center",
                },
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 800,
                px: 3,
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AvatarUploadCard profile={profile} />
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
              },
            }}
          >
            <Tab
              icon={<PersonOutlineOutlinedIcon />}
              iconPosition="start"
              label="Profile Information"
            />

            <Tab
              icon={<LockResetOutlinedIcon />}
              iconPosition="start"
              label="Change Password"
            />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

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

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateProfileMutation.isPending}
                  startIcon={<SaveOutlinedIcon />}
                  sx={{
                    height: 44,
                    borderRadius: "12px",
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
              <Alert severity="info">After changing password, you should sign in again.</Alert>

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

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                  disabled={changePasswordMutation.isPending}
                  startIcon={<LockResetOutlinedIcon />}
                  sx={{
                    height: 44,
                    borderRadius: "12px",
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