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
    <div className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Left: identity */}
      <div className="flex items-center gap-4 px-6 py-4 w-[380px] shrink-0">
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

      {/* Middle: controls */}
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        {controls}
      </div>

      {/* Right: action */}
      <div className="px-6 py-4 shrink-0">
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
          }}
        >
          {isExporting ? "Queuing..." : exportText}
        </Button>
      </div>
    </div>
  );
};
