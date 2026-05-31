import { Avatar, Button, LinearProgress } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { enqueueSnackbar } from "notistack";
import { useMemo, useRef, useState } from "react";
import { useUploadMyAvatarMutation } from "@/features/profile/hooks/useProfileMutations";
import { validateAvatarFile } from "@/features/profile/utils/avatarValidation";
import type { MyProfileResponse } from "@/types/user.types";

type AvatarUploadCardProps = {
  profile: MyProfileResponse;
};

function getInitialLetter(fullName?: string | null, email?: string | null) {
  const source = fullName || email || "U";
  return source.charAt(0).toUpperCase();
}

export function AvatarUploadCard({ profile }: AvatarUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatarMutation = useUploadMyAvatarMutation();
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => previewFileUrl || profile.avatarUrl || "",
    [previewFileUrl, profile.avatarUrl],
  );

  const handleSelectFile = async (file: File | null) => {
    if (!file) return;

    const validationMessage = validateAvatarFile(file);

    if (validationMessage) {
      enqueueSnackbar(validationMessage, { variant: "error" });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewFileUrl(objectUrl);

    try {
      await uploadAvatarMutation.mutateAsync(file);
      enqueueSnackbar("Avatar uploaded successfully.", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || "Upload avatar failed.", {
        variant: "error",
      });
      setPreviewFileUrl(null);
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {uploadAvatarMutation.isPending && <LinearProgress />}

      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={previewUrl}
            alt={profile.fullName}
            sx={{
              width: 132,
              height: 132,
              bgcolor: "#3b82f6",
              fontSize: 48,
              fontWeight: 900,
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
            }}
          >
            {getInitialLetter(profile.fullName, profile.email)}
          </Avatar>

          <h3 className="mt-5 text-lg font-black text-gray-900 dark:text-white">
            Profile Avatar
          </h3>

          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 dark:text-slate-400">
            Upload JPG, PNG, or WEBP. Maximum size is 3MB. File is uploaded by
            backend to Cloudinary.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleSelectFile(file);
              event.target.value = "";
            }}
          />

          <div className="mt-6">
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              disabled={uploadAvatarMutation.isPending}
              onClick={() => inputRef.current?.click()}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
              }}
            >
              {uploadAvatarMutation.isPending ? "Uploading..." : "Upload avatar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}