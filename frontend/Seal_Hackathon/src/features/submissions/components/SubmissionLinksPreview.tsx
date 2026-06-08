import type { SubmissionLinkResponse } from "@/types/submission.types";

type Props = {
  links: SubmissionLinkResponse[];
};

export function SubmissionLinksPreview({ links }: Props) {
  if (!links || links.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 italic">No links provided for this submission.</p>;
  }

  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.id} className="flex flex-col p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {link.label || link.linkType}
              {link.isPrimary && (
                <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-md uppercase font-extrabold tracking-wider">
                  Primary
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 uppercase">
              {link.linkType}
            </span>
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline truncate"
          >
            {link.url}
          </a>
        </li>
      ))}
    </ul>
  );
}