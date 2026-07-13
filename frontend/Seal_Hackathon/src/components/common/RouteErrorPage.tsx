import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router-dom";

function getHomePath(pathname: string) {
  if (pathname.startsWith("/admin")) return "/admin/dashboard";
  if (pathname.startsWith("/coordinator")) return "/coordinator/dashboard";
  if (pathname.startsWith("/judge")) return "/judge/dashboard";
  if (pathname.startsWith("/mentor")) return "/mentor/dashboard";
  if (pathname.startsWith("/participant")) return "/participant/teams";
  return "/events";
}

function getErrorCopy(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      return {
        title: "You don't have access to this page",
        description: "Your account is signed in, but this action is outside your current role.",
      };
    }
    if (error.status === 404) {
      return {
        title: "This page is no longer available",
        description: "The item may have been removed, renamed, or moved to another event.",
      };
    }
  }

  return {
    title: "This page couldn't load",
    description: "A display problem interrupted this page. Your saved data was not changed.",
  };
}

function getDeveloperMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`.trim();
  return "No additional error details are available.";
}

export function RouteErrorPage() {
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();
  const copy = getErrorCopy(error);
  const homePath = getHomePath(location.pathname);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-100 px-5 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.14)] dark:bg-slate-900 dark:shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
        <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-800 sm:px-9">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white dark:bg-white dark:text-slate-950">
              S
            </span>
            SEAL · PAGE RECOVERY
          </div>
        </div>

        <div className="px-7 pb-9 pt-8 sm:px-9 sm:pb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
            <ReportProblemOutlinedIcon />
          </div>

          <h1 className="mt-6 text-balance text-3xl font-black tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm leading-6 text-slate-600 dark:text-slate-300">
            {copy.description}
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
            Page: <span className="font-mono text-slate-700 dark:text-slate-300">{location.pathname}</span>
          </div>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.98]"
            >
              <RefreshOutlinedIcon fontSize="small" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate(homePath, { replace: true })}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-500 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <DashboardOutlinedIcon fontSize="small" />
              Go to dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowBackOutlinedIcon fontSize="small" />
              Back
            </button>
          </div>

          {import.meta.env.DEV && (
            <details className="mt-7 border-t border-slate-100 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <summary className="cursor-pointer select-none font-semibold">
                Developer details
              </summary>
              <pre className="mt-3 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-300">
                {getDeveloperMessage(error)}
              </pre>
            </details>
          )}
        </div>
      </section>
    </main>
  );
}
