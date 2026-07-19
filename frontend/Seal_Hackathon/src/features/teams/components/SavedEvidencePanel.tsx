import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InventoryOutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { SubmissionLinksPreview } from "@/features/submissions/components/SubmissionLinksPreview";
import type { SubmissionLinkResponse } from "@/types/submission.types";

const providerLabel: Record<string, [singular: string, plural: string]> = {
  AWS_S3: ["stored file", "stored files"],
  GOOGLE_DRIVE: ["Drive file", "Drive files"],
  GITHUB: ["repository", "repositories"],
  GITLAB: ["repository", "repositories"],
  EXTERNAL_URL: ["external link", "external links"],
};

/** Readable label for a provider the map does not know yet. */
function fallbackLabel(provider: string, count: number) {
  const spaced = provider.replaceAll("_", " ").toLowerCase();
  return count > 1 ? `${spaced}s` : spaced;
}

/**
 * Counts evidence per storage provider plus the number of repository links
 * that carry an immutable commit, so the summary chips prove the promise made
 * by the panel description instead of only restating it.
 */
function summarize(links: SubmissionLinkResponse[]) {
  const perProvider = new Map<string, number>();

  for (const link of links) {
    const key = link.storageProvider ?? "EXTERNAL_URL";
    perProvider.set(key, (perProvider.get(key) ?? 0) + 1);
  }

  const chips = [...perProvider.entries()].map(([provider, count]) => {
    const known = providerLabel[provider];
    const label = known
      ? known[count > 1 ? 1 : 0]
      : fallbackLabel(provider, count);
    return { key: provider, text: `${count} ${label}` };
  });

  const frozen = links.filter((link) => link.repoMetadata?.commitSha).length;
  if (frozen > 0) {
    chips.push({
      key: "frozen-commit",
      text: `${frozen} frozen commit${frozen > 1 ? "s" : ""}`,
    });
  }

  return chips;
}

type Props = {
  links: SubmissionLinkResponse[];
  onManage: () => void;
};

/**
 * Read-only record of what the team has actually filed for this round. It sits
 * under the requirements checklist so the page reads as "what is asked" then
 * "what is on file", with editing deliberately pushed to the submission page.
 */
export function SavedEvidencePanel({ links, onManage }: Props) {
  const chips = summarize(links);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <InventoryOutlinedIcon style={{ fontSize: 17 }} />
            <h2 className="text-xs font-bold uppercase tracking-[0.18em]">
              Saved submission evidence
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
            View persisted files, Drive resources, repositories, and frozen
            commits.
          </p>
        </div>

        <button
          type="button"
          onClick={onManage}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
        >
          Manage evidence
          <ArrowForwardIcon style={{ fontSize: 16 }} />
        </button>
      </div>

      {chips.length > 0 && (
        <ul
          aria-label="Evidence summary"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <li className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            {links.length} {links.length === 1 ? "item" : "items"}
          </li>
          {chips.map((chip) => (
            <li
              key={chip.key}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-slate-700 dark:text-slate-400"
            >
              {chip.text}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 border-t border-gray-100 pt-5 dark:border-slate-800">
        <SubmissionLinksPreview links={links} />
      </div>
    </section>
  );
}
