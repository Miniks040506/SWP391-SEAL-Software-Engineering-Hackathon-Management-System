const MAX_AVATAR_SIZE_MB = 3;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateAvatarFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Avatar must be JPG, PNG, or WEBP.";
  }

  if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
    return `Avatar must not exceed ${MAX_AVATAR_SIZE_MB}MB.`;
  }

  return null;
}