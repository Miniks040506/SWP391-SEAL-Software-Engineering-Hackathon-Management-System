import type { ReactNode } from "react";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  controls?: ReactNode;
  onExport: () => void;
  isExporting?: boolean;
  disabled?: boolean;
};

export const ExportReportCard = ({
  title,
  description,
  icon,
  controls,
  onExport,
  isExporting,
  disabled = false,
}: Props) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          {icon}
        </span>
        <div>
          <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="flex-1 border-y border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/30">
        {controls || (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Uses the complete selected event scope.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Excel workbook <span className="font-mono">.xlsx</span>
        </span>
        <button
          type="button"
          disabled={isExporting || disabled}
          onClick={onExport}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
        >
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          {isExporting ? "Preparing" : "Export and download"}
        </button>
      </div>
    </article>
  );
};
