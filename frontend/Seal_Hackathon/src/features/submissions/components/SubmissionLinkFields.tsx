import { useState } from "react";
import { TextField } from "@mui/material";
import { filterTextFieldSx } from "../schemas/submissions.schema";

export type LinkFieldValue = {
  linkType: string;
  label: string;
  url: string;
  isPrimary: boolean;
  isRequired: boolean;
  linkId?: string;
};

type Props = {
  fields: LinkFieldValue[];
  onChange: (fields: LinkFieldValue[]) => void;
  disabled?: boolean;
};

const PROVIDER_ICONS: Record<string, { icon: string; color: string; hint: string }> = {
  GITHUB: {
    icon: "github",
    color: "text-slate-800 dark:text-slate-200",
    hint: "https://github.com/org/repo",
  },
  GITLAB: {
    icon: "gitlab",
    color: "text-orange-600 dark:text-orange-400",
    hint: "https://gitlab.com/org/repo",
  },
  GOOGLE_DRIVE: {
    icon: "drive",
    color: "text-blue-600 dark:text-blue-400",
    hint: "https://drive.google.com/...",
  },
  DEMO: {
    icon: "demo",
    color: "text-purple-600 dark:text-purple-400",
    hint: "https://your-demo.com",
  },
  SLIDE: {
    icon: "slide",
    color: "text-rose-600 dark:text-rose-400",
    hint: "https://slides.google.com/...",
  },
  OTHER: {
    icon: "link",
    color: "text-slate-500 dark:text-slate-400",
    hint: "https://...",
  },
};

function ProviderIcon({ type }: { type: string }) {
  const meta = PROVIDER_ICONS[type] ?? PROVIDER_ICONS.OTHER;
  const base = `w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base font-bold select-none border`;

  if (type === "GITHUB") {
    return (
      <div className={`${base} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${meta.color}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      </div>
    );
  }

  if (type === "GITLAB") {
    return (
      <div className={`${base} bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 ${meta.color}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
        </svg>
      </div>
    );
  }

  if (type === "GOOGLE_DRIVE") {
    return (
      <div className={`${base} bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 ${meta.color}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M6.812 21L1.5 12l4.5-7.794h11.988L22.5 12 17.188 21H6.812zm1.04-1.5h8.296l4.148-7.5-4.148-7.5H7.852L3.704 12l4.148 7.5zM8.5 17l-3-5.5 3-5.5h7l3 5.5-3 5.5h-7z"/>
        </svg>
      </div>
    );
  }

  if (type === "DEMO") {
    return (
      <div className={`${base} bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 ${meta.color}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>
    );
  }

  if (type === "SLIDE") {
    return (
      <div className={`${base} bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 ${meta.color}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${base} bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 ${meta.color}`}>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    </div>
  );
}

function validateUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must start with http:// or https://";
    }
    return null;
  } catch {
    return "Invalid URL format";
  }
}

export function SubmissionLinkFields({ fields, onChange, disabled = false }: Props) {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (index: number, url: string) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], url };
    onChange(updated);
  };

  const handleBlur = (linkType: string) => {
    setTouched((prev) => new Set(prev).add(linkType));
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const error = touched.has(field.linkType) ? validateUrl(field.url) : null;
        const meta = PROVIDER_ICONS[field.linkType] ?? PROVIDER_ICONS.OTHER;

        return (
          <div
            key={field.linkType}
            className={`relative rounded-xl border transition-all ${
              error
                ? "border-rose-300 dark:border-rose-500/40 bg-rose-50/30 dark:bg-rose-500/5"
                : field.url
                ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-500/5"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
            } p-4`}
          >
            <div className="flex items-start gap-3">
              <ProviderIcon type={field.linkType} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {field.label || field.linkType}
                  </span>
                  {field.isPrimary && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded font-extrabold uppercase tracking-wider border border-blue-200 dark:border-blue-500/30">
                      Primary
                    </span>
                  )}
                  {field.isRequired && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded font-extrabold uppercase tracking-wider border border-amber-200 dark:border-amber-500/30">
                      Required
                    </span>
                  )}
                </div>

                <TextField
                  fullWidth
                  size="small"
                  value={field.url}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onBlur={() => handleBlur(field.linkType)}
                  placeholder={meta.hint}
                  disabled={disabled}
                  error={Boolean(error)}
                  helperText={error || undefined}
                  sx={filterTextFieldSx}
                  slotProps={{
                    input: {
                      endAdornment: field.url && !error ? (
                        <svg className="text-emerald-500 shrink-0" viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      ) : undefined,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}