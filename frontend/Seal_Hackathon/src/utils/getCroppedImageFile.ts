import type { Area } from "react-easy-crop";

type GetCroppedImageFileArgs = {
  imageUrl: string;
  croppedAreaPixels: Area;
  fileName: string;
  outputType?: "image/jpeg" | "image/png" | "image/webp";
};

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = imageUrl;
  });
}

function getFileExtension(outputType: string) {
  if (outputType === "image/png") return "png";
  if (outputType === "image/webp") return "webp";
  return "jpg";
}

export async function getCroppedImageFile({
  imageUrl,
  croppedAreaPixels,
  fileName,
  outputType = "image/jpeg",
}: GetCroppedImageFileArgs): Promise<File> {
  const image = await loadImage(imageUrl);

  const canvas = document.createElement("canvas");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Cannot create canvas context.");
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error("Cannot crop image."));
          return;
        }

        resolve(nextBlob);
      },
      outputType,
      0.92,
    );
  });

  const safeBaseName = fileName.replace(/\.[^.]+$/, "");
  const extension = getFileExtension(outputType);

  return new File([blob], `${safeBaseName}-cropped.${extension}`, {
    type: outputType,
  });
}
