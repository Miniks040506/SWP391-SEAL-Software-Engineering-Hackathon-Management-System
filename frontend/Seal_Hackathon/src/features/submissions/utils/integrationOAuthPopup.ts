/**
 * Provider OAuth without leaving the page.
 *
 * The panels used to call `window.location.assign(authorizationUrl)`, which
 * navigated the whole SPA away. Returning from the provider remounted the app,
 * so the attachment dialog, its active tab, and any unsaved link drafts were
 * all lost — the connection appeared to "kick you out".
 *
 * Instead the provider runs in a popup that returns to
 * `INTEGRATION_CALLBACK_PATH`. That route posts the outcome back to this window
 * and closes itself, so the dialog underneath never unmounts.
 */

export type IntegrationProvider = "github" | "googleDrive";

export type IntegrationOAuthResult = {
  provider: IntegrationProvider;
  result: "connected" | "error";
  code: string | null;
  privateRepositories?: boolean;
};

/** Return path handed to the backend; must stay a local path. */
export const INTEGRATION_CALLBACK_PATH = "/oauth/integration-callback";

/** Marks our own postMessage payloads so unrelated messages are ignored. */
export const INTEGRATION_MESSAGE_SOURCE = "seal-integration-oauth";

/** Thrown when the browser blocked the popup, so callers can fall back. */
export class PopupBlockedError extends Error {
  constructor() {
    super("The browser blocked the connection window.");
    this.name = "PopupBlockedError";
  }
}

/** Thrown when the window closed before the provider reported a result. */
export class PopupClosedError extends Error {
  constructor() {
    super("The connection window was closed before finishing.");
    this.name = "PopupClosedError";
  }
}

function isResultPayload(
  value: unknown,
  provider: IntegrationProvider,
): value is IntegrationOAuthResult & { source: string } {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.source === INTEGRATION_MESSAGE_SOURCE &&
    payload.provider === provider &&
    (payload.result === "connected" || payload.result === "error")
  );
}

/** Maps a backend Google Drive callback code to a message a student can act on. */
export function googleDriveCallbackError(code: string | null) {
  if (code === "GOOGLE_DRIVE_AUTHORIZATION_CANCELLED") {
    return "Google Drive connection was cancelled.";
  }
  if (code === "GOOGLE_DRIVE_OAUTH_STATE_INVALID") {
    return "Google Drive connection expired or could not be verified. Start again.";
  }
  if (code === "GOOGLE_DRIVE_AUTHORIZATION_INVALID") {
    return "Google Drive authorization is no longer valid. Connect again.";
  }
  return "Google Drive could not be connected. Check provider setup and retry.";
}

/** Maps a backend GitHub callback code to a message a student can act on. */
export function githubCallbackError(code: string | null) {
  if (code === "GITHUB_AUTHORIZATION_CANCELLED") {
    return "GitHub connection was cancelled.";
  }
  if (code === "GITHUB_OAUTH_STATE_INVALID") {
    return "GitHub connection expired or could not be verified. Start again.";
  }
  if (code === "GITHUB_AUTHORIZATION_INVALID") {
    return "GitHub authorization is no longer valid. Connect again.";
  }
  return "GitHub could not be connected. Check provider setup and retry.";
}

export function openIntegrationOAuthPopup(
  authorizationUrl: string,
  provider: IntegrationProvider,
): Promise<IntegrationOAuthResult> {
  const width = 640;
  const height = 760;
  // Centre on the window the user is actually looking at, not screen 0.
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  const popup = window.open(
    authorizationUrl,
    `seal-${provider}-oauth`,
    `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`,
  );

  if (!popup || popup.closed) {
    return Promise.reject(new PopupBlockedError());
  }

  return new Promise<IntegrationOAuthResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(closeTimer);
    };

    const finish = (run: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      run();
    };

    function handleMessage(event: MessageEvent) {
      // Only trust messages this app sent to itself.
      if (event.origin !== window.location.origin) return;
      if (!isResultPayload(event.data, provider)) return;

      const { result, code, privateRepositories } = event.data;
      finish(() => {
        try {
          popup?.close();
        } catch {
          // Closing is best-effort; the callback route closes itself too.
        }
        resolve({ provider, result, code: code ?? null, privateRepositories });
      });
    }

    // The popup cannot notify us if the user dismisses it, so poll for that.
    const closeTimer = window.setInterval(() => {
      if (popup.closed) {
        finish(() => reject(new PopupClosedError()));
      }
    }, 500);

    window.addEventListener("message", handleMessage);
  });
}
