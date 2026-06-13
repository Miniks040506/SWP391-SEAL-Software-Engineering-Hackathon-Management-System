import { useState, useRef } from "react";
import { TextField } from "@mui/material";
import { filterTextFieldSx } from "../schemas/submissions.schema";
import type { LinkFieldValue } from "@/types/submission.types";

const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "image/png",
  "image/webp",
  "image/jpeg",
  "text/plain"
];


type Props = {
  fields: LinkFieldValue[];
  onChange: (fields: LinkFieldValue[]) => void;
  disabled?: boolean;
};

const PROVIDER_ICONS: Record<string, { color: string; hint: string }> = {
  REPOSITORY: {
    color: "text-slate-800 dark:text-slate-200",
    hint: "https://github.com/org/repo",
  },
  DEMO: {
    color: "text-purple-600 dark:text-purple-400",
    hint: "https://your-demo.com",
  },
  SLIDE: {
    color: "text-rose-600 dark:text-rose-400",
    hint: "https://slides.google.com/...",
  },
  REPORT: {
    color: "text-blue-600 dark:text-blue-400",
    hint: "https://drive.google.com/...",
  },
  VIDEO: {
    color: "text-red-600 dark:text-red-400",
    hint: "https://drive.google.com/...",
  },
  OTHER: {
    color: "text-slate-500 dark:text-slate-400",
    hint: "https://...",
  },
};

function ProviderIcon({ type }: { type: string }) {
  const meta = PROVIDER_ICONS[type] ?? PROVIDER_ICONS.OTHER;
  const base = `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold select-none border shadow-sm`;

  if (type === "REPOSITORY")
    return (
      <div
        className={`${base} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${meta.color}`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      </div>
    );

  if (type === "DEMO")
    return (
      <div
        className={`${base} bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 ${meta.color}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    );

  if (type === "SLIDE")
    return (
      <div
        className={`${base} bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 ${meta.color}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
    );

  if (type === "REPORT")
    return (
      <div
        className={`${base} bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 ${meta.color}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
    );

  if (type === "VIDEO")
    return (
      <div
        className={`${base} bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 ${meta.color}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </div>
    );

  return (
    <div
      className={`${base} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${meta.color}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    </div>
  );
}

function validateUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return "URL must start with http:// or https://";
    return null;
  } catch {
    return "Invalid URL format";
  }
}

export function SubmissionLinkFields({
  fields,
  onChange,
  disabled = false,
}: Props) {
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const updateField = (index: number, updates: Partial<LinkFieldValue>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {fields.map((field, index) => {
        const error =
          touched.has(field.linkType) && field.inputType === "url"
            ? validateUrl(field.url)
            : null;
        const meta = PROVIDER_ICONS[field.linkType] ?? PROVIDER_ICONS.OTHER;
        const isFilled =
          field.inputType === "url"
            ? Boolean(field.url && !error)
            : Boolean(field.file);

        return (
          <div
            key={field.linkType}
            className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
              error
                ? "border-rose-300 bg-rose-50/30"
                : isFilled
                  ? "border-emerald-400 bg-emerald-50/10 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4 p-5 border-b border-slate-100 dark:border-slate-700/50">
              <ProviderIcon type={field.linkType} />
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200 truncate">
                    {field.label || field.linkType}
                  </span>
                </div>
                <div className="flex gap-2">
                  {field.isPrimary && (
                    <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md font-extrabold uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                  {field.isRequired && (
                    <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded-md font-extrabold uppercase tracking-wider">
                      Required
                    </span>
                  )}
                </div>
              </div>
              {isFilled && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex bg-slate-200/50 dark:bg-slate-700 p-1 rounded-lg mb-4 w-max">
                <button
                  type="button"
                  onClick={() =>
                    updateField(index, { inputType: "url", file: null })
                  }
                  disabled={disabled}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${field.inputType === "url" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Link URL
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateField(index, { inputType: "file", url: "" })
                  }
                  disabled={disabled}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${field.inputType === "file" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Upload File
                </button>
              </div>

              {field.inputType === "url" ? (
                <TextField
                  fullWidth
                  size="small"
                  value={field.url}
                  onChange={(e) => updateField(index, { url: e.target.value })}
                  onBlur={() =>
                    setTouched((prev) => new Set(prev).add(field.linkType))
                  }
                  placeholder={meta.hint}
                  disabled={disabled}
                  error={Boolean(error)}
                  helperText={error || undefined}
                  sx={filterTextFieldSx}
                />
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${field.file ? "border-blue-400 bg-blue-50/50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!disabled && e.dataTransfer.files?.[0]) {
                      const file = e.dataTransfer.files[0];
                      if (!ALLOWED_CONTENT_TYPES.includes(file.type)) return;
                      if (file.size > 25 * 1024 * 1024) return;
                      updateField(index, { file });
                    }
                  }}
                >
                  <input
                    type="file"
                    accept={ALLOWED_CONTENT_TYPES.join(",")}
                    className="hidden"
                    disabled={disabled}
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        if (!ALLOWED_CONTENT_TYPES.includes(file.type)) return;
                        if (file.size > 25 * 1024 * 1024) return;
                        updateField(index, { file });
                      }
                    }}
                  />
                  {field.file ? (
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-8 h-8 text-blue-500 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-bold text-slate-700 truncate max-w-50">
                        {field.file.name}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        {(field.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {!disabled && (
                        <button
                          onClick={() => updateField(index, { file: null })}
                          className="text-xs text-rose-500 hover:underline mt-2 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() =>
                        !disabled && fileInputRefs.current[index]?.click()
                      }
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <svg
                          className="w-5 h-5 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        Click to upload
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        or drag and drop
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
