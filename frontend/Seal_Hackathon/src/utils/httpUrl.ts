import { API_BASE_URL } from "@/api/axiosClient";

const HOST_WITHOUT_SCHEME = /^[a-z0-9.-]+:\d+(?:\/|$)/i;

export function resolveHttpUrl(raw?: string | null) {
  const value = raw?.trim();
  if (!value) return null;

  const candidate = HOST_WITHOUT_SCHEME.test(value) ? `http://${value}` : value;

  try {
    const baseUrl = new URL(
      API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`,
      window.location.origin,
    );
    const resolved = new URL(candidate, baseUrl);

    return resolved.protocol === "http:" || resolved.protocol === "https:"
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
}

export function openHttpUrl(raw?: string | null) {
  const resolved = resolveHttpUrl(raw);
  if (!resolved) return false;

  const anchor = document.createElement("a");
  anchor.href = resolved;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}
