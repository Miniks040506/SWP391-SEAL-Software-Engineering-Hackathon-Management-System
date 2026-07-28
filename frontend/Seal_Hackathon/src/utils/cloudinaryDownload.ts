export function getCloudinaryDownloadUrl(
  url: string,
  fileName = "exam-paper.pdf",
) {
  const marker = "/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;

  const attachmentName = fileName
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9_-]+/gi, "-");
  return url.replace(marker, `${marker}fl_attachment:${attachmentName}/`);
}
