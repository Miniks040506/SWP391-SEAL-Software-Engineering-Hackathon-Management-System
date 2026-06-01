import type { Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    image.src = url;
  });
}

export async function getCroppedAvatarFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = "avatar.png",
): Promise<File> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Cannot create canvas context.");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Cannot crop image."));
          return;
        }

        resolve(
          new File([blob], fileName.replace(/\.[^/.]+$/, ".png"), {
            type: "image/png",
          }),
        );
      },
      "image/png",
      0.95,
    );
  });
}