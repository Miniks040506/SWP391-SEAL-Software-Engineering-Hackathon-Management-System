import type { RequiredLinkConfig } from "@/types/submission.types";

type LinkTypeStatus = RequiredLinkConfig & { isFilled: boolean };

type Props = {
  linkTypes: LinkTypeStatus[];
};

export function RequiredLinkTypeChecklist({ linkTypes }: Props) {
  const required = linkTypes.filter((l) => l.isRequired);
  if (required.length === 0) return null;

  const allFilled = required.every((l) => l.isFilled);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Required Links
        </p>
        {allFilled ? (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
            All filled
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Incomplete
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {required.map((item) => (
          <li key={item.linkType} className="flex items-center gap-2.5">
            {item.isFilled ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
            )}
            <span className={`text-sm font-medium ${item.isFilled ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
              {item.label || item.linkType}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}