import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Alert } from "@mui/material";
import type {
  SubmissionInputSource,
  SubmissionRequirementsResponse,
} from "@/types/submission.types";

type Props = {
  requirements: SubmissionRequirementsResponse;
  title?: string;
  showPermissionMessage?: boolean;
};

const sourceLabels: Record<SubmissionInputSource, string> = {
  URL: "URL",
  LOCAL_FILE: "Local file",
  GOOGLE_DRIVE: "Google Drive",
  GITHUB: "GitHub",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  const megabytes = bytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)} MB`;
}

export function SubmissionRequirementsPanel({
  requirements,
  title = "What you must submit",
  showPermissionMessage = true,
}: Props) {
  const orderedRequirements = [...requirements.requirements].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
  const unavailableProviders = requirements.providerAvailability.filter(
    (provider) => !provider.available,
  );
  const missingCount = requirements.missingRequiredTypes.length;

  return (
    <section
      aria-labelledby="submission-requirements-title"
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-500">
            Submission checklist
          </p>
          <h2
            id="submission-requirements-title"
            className="mt-1 text-xl font-black text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Choose a submission type explicitly when adding each deliverable.
          </p>
        </div>

        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide",
            missingCount === 0
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
          ].join(" ")}
        >
          {missingCount === 0 ? "Requirements complete" : `${missingCount} required missing`}
        </span>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {orderedRequirements.map((item) => (
          <li
            key={item.type}
            className={[
              "rounded-xl border p-4",
              item.satisfied
                ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10"
                : item.required
                  ? "border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10"
                  : "border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-950",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              {item.satisfied ? (
                <CheckCircleIcon className="text-emerald-500" fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon
                  className={item.required ? "text-amber-500" : "text-gray-400"}
                  fontSize="small"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-black uppercase text-gray-500 dark:bg-slate-800 dark:text-slate-300">
                    {item.required ? "Required" : "Optional"}
                  </span>
                  {item.primary && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      Primary
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {item.satisfied ? "Completed" : item.required ? "Missing" : "Not added"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.allowedSources.map((source) => (
                    <span
                      key={source}
                      className="rounded-full border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {sourceLabels[source]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-3">
        <div>
          <p className="text-xs font-black uppercase text-gray-400">Maximum file size</p>
          <p className="mt-1 font-bold text-gray-800 dark:text-slate-200">
            {formatFileSize(requirements.uploadPolicy.maximumFileSizeBytes)} per file
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-gray-400">Maximum files</p>
          <p className="mt-1 font-bold text-gray-800 dark:text-slate-200">
            {requirements.uploadPolicy.maximumFiles}
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-gray-400">Allowed extensions</p>
          <p className="mt-1 break-words font-bold text-gray-800 dark:text-slate-200">
            {requirements.uploadPolicy.acceptedExtensions.join(", ")}
          </p>
        </div>
      </div>

      {showPermissionMessage && requirements.blockedReason !== "NONE" && (
        <Alert severity={requirements.canEdit ? "warning" : "info"}>
          {requirements.blockedMessage ?? "Submission changes are not available right now."}
        </Alert>
      )}

      {unavailableProviders.length > 0 && (
        <div className="space-y-2" aria-label="Unavailable submission providers">
          {unavailableProviders.map((provider) => (
            <div
              key={provider.source}
              className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <CloudOffIcon style={{ fontSize: 16 }} className="mt-0.5 shrink-0" />
              <span>
                <strong>{sourceLabels[provider.source]}:</strong>{" "}
                {provider.message ?? "This provider is currently unavailable."}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
