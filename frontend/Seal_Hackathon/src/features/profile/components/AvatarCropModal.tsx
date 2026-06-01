import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Button, Dialog, IconButton, Slider } from "@mui/material";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedAvatarFile } from "@/features/profile/utils/cropImage";

type AvatarCropModalProps = {
  open: boolean;
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
  onApply: (file: File) => Promise<void> | void;
};

export function AvatarCropModal({
  open,
  imageUrl,
  fileName = "avatar.png",
  onClose,
  onApply,
}: AvatarCropModalProps) {
  
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(nextCroppedAreaPixels);
    },
    [],
  );

  const handleApply = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsApplying(true);

      const croppedFile = await getCroppedAvatarFile(
        imageUrl,
        croppedAreaPixels,
        fileName,
      );

      await onApply(croppedFile);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Dialog
      open={open}
      onClose={isApplying ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
            bgcolor: "#2b2d31",
            color: "white",
          },
        },
      }}
    >
      <div className="bg-[#2b2d31] text-white">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-black">Chỉnh sửa Hình ảnh</h2>

          <IconButton
            onClick={onClose}
            disabled={isApplying}
            sx={{
              color: "#b5bac1",
              "&:hover": {
                color: "white",
                bgcolor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </div>

        <div className="px-6">
          <div className="relative h-64 overflow-hidden rounded-xl bg-[#1e1f22]">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              objectFit="cover"
            />
          </div>

          <div className="mt-5 flex items-center gap-4 px-2">
            <ImageOutlinedIcon sx={{ fontSize: 18, color: "#b5bac1" }} />

            <Slider
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              sx={{
                color: "#5865f2",
                "& .MuiSlider-thumb": {
                  bgcolor: "white",
                },
                "& .MuiSlider-rail": {
                  bgcolor: "#4e5058",
                },
              }}
            />

            <ImageOutlinedIcon sx={{ fontSize: 24, color: "#b5bac1" }} />
          </div>

          <div className="mt-5 rounded-xl bg-[#383a40] px-4 py-3 text-sm font-bold text-white">
            Drag the image to adjust its position. Use the slider to zoom in/out.
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between bg-[#2b2d31] px-6 pb-6">
          <button
            type="button"
            onClick={handleReset}
            disabled={isApplying}
            className="text-sm font-bold text-indigo-300 transition hover:underline disabled:opacity-60"
          >
            Đặt lại
          </button>

          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              disabled={isApplying}
              sx={{
                height: 44,
                borderRadius: "8px",
                px: 3,
                bgcolor: "#3f4147",
                color: "white",
                textTransform: "none",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#4e5058",
                },
              }}
            >
              Cancle
            </Button>

            <Button
              onClick={handleApply}
              disabled={isApplying}
              sx={{
                height: 44,
                borderRadius: "8px",
                px: 3,
                bgcolor: "#5865f2",
                color: "white",
                textTransform: "none",
                fontWeight: 900,
                "&:hover": {
                  bgcolor: "#4752c4",
                },
              }}
            >
              {isApplying ? "Đang lưu..." : "Apply"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}