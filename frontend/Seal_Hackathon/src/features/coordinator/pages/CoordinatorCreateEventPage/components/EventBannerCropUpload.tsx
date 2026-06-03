import { useEffect, useMemo, useRef, useState } from "react";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Button } from "@mui/material";
import { enqueueSnackbar } from "notistack";

import { ImageCropModal } from "@/components/common/ImageCropModal";

type EventBannerCropUploadProps = {
  file: File | null;
  onChange: (file: File | null) => void;
};

const MAX_BANNER_SIZE_MB = 5;

function validateBannerFile(file: File) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return "Banner must be JPG, PNG, or WEBP.";
  }

  if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
    return `Banner must not exceed ${MAX_BANNER_SIZE_MB}MB.`;
  }

  return null;
}

export function EventBannerCropUpload({
  file,
  onChange,
}: EventBannerCropUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("event-banner.jpg");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closeCropModal = () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);

    setCropImageUrl(null);
    setCropFileName("event-banner.jpg");
  };

  const handleSelectFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const validationMessage = validateBannerFile(selectedFile);

    if (validationMessage) {
      enqueueSnackbar(validationMessage, { variant: "error" });
      return;
    }

    setCropImageUrl(URL.createObjectURL(selectedFile));
    setCropFileName(selectedFile.name || "event-banner.jpg");
  };

  const handleApplyCroppedBanner = (croppedFile: File) => {
    onChange(croppedFile);
    closeCropModal();
  };

  return (
    <>
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 transition-colors dark:border-slate-700 dark:bg-slate-900">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] ?? null;
            handleSelectFile(selectedFile);
            event.target.value = "";
          }}
        />

        <div className="grid gap-5 md:grid-cols-[1fr_240px] md:items-center">
          <div className="h-44 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Event banner preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400 dark:text-slate-500">
                No banner selected
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              type="button"
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => inputRef.current?.click()}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 900,
                boxShadow: "none",
                bgcolor: "#4f6bff",
                "&:hover": { bgcolor: "#3f5bef", boxShadow: "none" },
              }}
            >
              Choose banner
            </Button>

            {file && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-500 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                Remove banner
              </button>
            )}

            <p className="text-center text-xs font-medium leading-5 text-slate-400">
              JPG, PNG, WEBP. Max {MAX_BANNER_SIZE_MB}MB. You can crop and
              reposition before creating event.
            </p>
          </div>
        </div>
      </div>

      {cropImageUrl && (
        <ImageCropModal
          open={Boolean(cropImageUrl)}
          title="Chỉnh sửa banner"
          imageUrl={cropImageUrl}
          fileName={cropFileName}
          aspect={16 / 9}
          cropShape="rect"
          outputType="image/jpeg"
          onClose={closeCropModal}
          onApply={handleApplyCroppedBanner}
        />
      )}
    </>
  );
}
