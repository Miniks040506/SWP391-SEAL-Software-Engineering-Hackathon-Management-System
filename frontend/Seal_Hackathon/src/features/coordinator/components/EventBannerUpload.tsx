import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { Button } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

type EventBannerUploadProps = {
  file?: File | null;
  bannerUrl?: string | null;
  onChange: (file: File | null) => void;
};

export function EventBannerUpload({
  file,
  bannerUrl,
  onChange,
}: EventBannerUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return bannerUrl || "";
    return URL.createObjectURL(file);
  }, [file, bannerUrl]);

  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="aspect-21/9 flex-1 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {previewUrl ? (
            <img src={previewUrl} alt="Event banner preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
              No banner selected
            </div>
          )}
        </div>

        <div className="md:w-48">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              onChange(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />

          <Button
            fullWidth
            variant="contained"
            startIcon={<CloudUploadOutlinedIcon />}
            onClick={() => inputRef.current?.click()}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900, boxShadow: "none" }}
          >
            Choose banner
          </Button>

          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-3 w-full text-sm font-bold text-rose-500 hover:underline"
            >
              Remove file
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
