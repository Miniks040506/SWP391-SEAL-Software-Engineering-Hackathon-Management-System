import { Avatar, Button, LinearProgress } from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { enqueueSnackbar } from "notistack";
import { useMemo, useRef, useState } from "react";
import { AvatarCropModal } from "@/features/profile/components/AvatarCropModal";
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

function getRequestErrorMessage(error: unknown) {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message;
  return typeof responseMessage === "string" ? responseMessage : "Upload avatar failed.";
}

export function AvatarUploadCard({ profile }: AvatarUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatarMutation = useUploadMyAvatarMutation();

  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("avatar.png");

  const previewUrl = useMemo(
    () => previewFileUrl || profile.avatarUrl || "",
    [previewFileUrl, profile.avatarUrl],
  );

  const closeCropModal = () => {
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }

    setCropImageUrl(null);
    setCropFileName("avatar.png");
  };

  const handleSelectFile = (file: File | null) => {
    if (!file) return;

    const validationMessage = validateAvatarFile(file);

    if (validationMessage) {
      enqueueSnackbar(validationMessage, {
        variant: "error",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setCropImageUrl(objectUrl);
    setCropFileName(file.name || "avatar.png");
  };

  const handleApplyCroppedAvatar = async (croppedFile: File) => {
    const croppedPreviewUrl = URL.createObjectURL(croppedFile);

    setPreviewFileUrl(croppedPreviewUrl);

    try {
      await uploadAvatarMutation.mutateAsync(croppedFile);

      enqueueSnackbar("Avatar uploaded successfully.", {
        variant: "success",
      });

      closeCropModal();
    } catch (error: unknown) {
      URL.revokeObjectURL(croppedPreviewUrl);
      setPreviewFileUrl(null);

      enqueueSnackbar(
        getRequestErrorMessage(error),
        {
          variant: "error",
        },
      );
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
        {uploadAvatarMutation.isPending && <LinearProgress sx={{ height: 3 }} />}

        <div className="p-6 sm:p-7">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={previewUrl}
              alt={profile.fullName}
              sx={{
                width: 144,
                height: 144,
                borderRadius: "28px",
                bgcolor: "#2563eb",
                fontSize: 50,
                fontWeight: 800,
                boxShadow: "0 20px 42px rgba(15, 23, 42, 0.18)",
              }}
            >
              {getInitialLetter(profile.fullName, profile.email)}
            </Avatar>

            <h3 className="mt-6 text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Profile photo
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              Add a clear image so teammates and organizers can recognize you quickly.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                handleSelectFile(file);
                event.target.value = "";
              }}
            />

            <div className="mt-6 w-full">
              <Button
                variant="contained"
                startIcon={<CloudUploadOutlinedIcon />}
                disabled={uploadAvatarMutation.isPending}
                onClick={() => inputRef.current?.click()}
                sx={{
                  width: "100%",
                  height: 46,
                  borderRadius: "11px",
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "none",
                }}
              >
                {uploadAvatarMutation.isPending
                  ? "Uploading..."
                  : "Upload avatar"}
              </Button>
            </div>

            <div className="mt-7 flex w-full items-start gap-3 rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950/50">
              <ImageOutlinedIcon className="mt-0.5 text-blue-600 dark:text-blue-300" sx={{ fontSize: 19 }} />
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                JPG, PNG, and WEBP files are supported. You can crop the image before it is uploaded.
              </p>
            </div>
          </div>
        </div>
      </div>

      {cropImageUrl && (
        <AvatarCropModal
          open={Boolean(cropImageUrl)}
          imageUrl={cropImageUrl}
          fileName={cropFileName}
          onClose={closeCropModal}
          onApply={handleApplyCroppedAvatar}
        />
      )}
    </>
  );
}
