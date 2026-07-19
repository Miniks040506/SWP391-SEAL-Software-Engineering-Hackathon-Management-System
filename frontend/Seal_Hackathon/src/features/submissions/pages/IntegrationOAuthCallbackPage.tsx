import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  INTEGRATION_MESSAGE_SOURCE,
  type IntegrationProvider,
} from "../utils/integrationOAuthPopup";

/**
 * Landing route for provider OAuth redirects.
 *
 * Normally this renders for a few milliseconds inside a popup: it reports the
 * outcome to the window that opened it and closes. If the popup was blocked and
 * the provider opened in the same tab, there is no opener to talk to, so it
 * falls back to a visible message with a way back.
 */
export function IntegrationOAuthCallbackPage() {
  const [params] = useSearchParams();
  // Set only if the browser refuses to close us after reporting back.
  const [closeBlocked, setCloseBlocked] = useState(false);
  const reportedRef = useRef(false);

  // The backend tags the redirect with the provider it handled.
  const provider: IntegrationProvider | null = params.has("github")
    ? "github"
    : params.has("googleDrive")
      ? "googleDrive"
      : null;

  const result = provider ? params.get(provider) : null;
  const code = params.get("code");
  const privateRepositories = params.get("privateRepositories") === "true";

  // Whether we have someone to report to is knowable during render.
  const opener = window.opener as Window | null;
  const canReport = Boolean(opener && opener !== window && provider);
  const standalone = !canReport || closeBlocked;

  useEffect(() => {
    if (!canReport || !opener || !provider) return;

    // StrictMode re-runs effects in development, so report exactly once — but
    // still re-arm the close timer below, or the popup would never close.
    if (!reportedRef.current) {
      reportedRef.current = true;
      opener.postMessage(
        {
          source: INTEGRATION_MESSAGE_SOURCE,
          provider,
          result: result === "connected" ? "connected" : "error",
          code,
          privateRepositories,
        },
        window.location.origin,
      );
    }

    // Give the opener a tick to receive the message before tearing down.
    const timer = window.setTimeout(() => {
      window.close();
      // If the browser refuses to close us, show something useful instead.
      setCloseBlocked(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [canReport, opener, provider, result, code, privateRepositories]);

  if (!standalone) {
    return (
      <p className="p-6 text-sm text-gray-500 dark:text-slate-400" role="status">
        Finishing the connection…
      </p>
    );
  }

  const connected = result === "connected";

  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {connected ? "Connection complete" : "Connection failed"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
        {connected
          ? "You can close this window and return to your submission."
          : "The provider did not complete the connection. Close this window and try again from the submission page."}
      </p>
      <button
        type="button"
        onClick={() => window.close()}
        className="mt-6 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900"
      >
        Close window
      </button>
    </div>
  );
}
