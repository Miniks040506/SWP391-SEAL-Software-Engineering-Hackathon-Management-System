import { type ReactNode } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  controls?: ReactNode;
  onExport: () => void;
  isExporting?: boolean;
  exportText?: string;
  disabled?: boolean;
};

export const ExportReportCard = ({
  title,
  description,
  icon,
  iconBgClass,
  iconColorClass,
  controls,
  onExport,
  isExporting,
  exportText = "Export",
  disabled = false,
}: Props) => {
  return (
    <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md xl:grid-cols-[minmax(260px,380px)_1fr_auto] xl:items-center dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-4 px-5 py-4 sm:px-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 border-y border-slate-100 px-5 py-4 sm:px-6 xl:border-x xl:border-y-0 dark:border-slate-800">
        {controls}
      </div>

      <div className="px-5 pb-5 pt-4 sm:px-6 xl:p-5">
        <Button
          variant="contained"
          disableElevation
          disabled={isExporting || disabled}
          onClick={onExport}
          startIcon={isExporting ? <CircularProgress size={14} color="inherit" /> : <FileDownloadOutlinedIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            whiteSpace: "nowrap",
            minWidth: 130,
            height: 38,
            width: { xs: "100%", xl: "auto" },
          }}
        >
          {isExporting ? "Queuing..." : exportText}
        </Button>
      </div>
    </article>
  );
};
