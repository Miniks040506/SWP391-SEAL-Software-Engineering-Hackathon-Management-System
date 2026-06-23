import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type Props = {
  links: { id: string; type: string; url: string }[];
};

export const SubmissionEvidencePanel = ({ links }: Props) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Typography variant="h6" className="mb-4 font-extrabold text-gray-900 dark:text-slate-100">
        Submission Evidence
      </Typography>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-slate-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900 dark:hover:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                <OpenInNewIcon fontSize="small" className="text-gray-400 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">{link.type}</p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-200">View Resource</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
