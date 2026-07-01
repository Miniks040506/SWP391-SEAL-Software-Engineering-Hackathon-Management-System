import { type ReactNode } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  children: ReactNode;
  onExport: () => void;
  isExporting?: boolean;
  exportText?: string;
  disabled?: boolean;
};

export const ExportReportCard = ({
  title,
  description,
  icon,
  iconBgColor,
  iconColor,
  children,
  onExport,
  isExporting,
  exportText = "Export",
  disabled = false,
}: Props) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 min-h-[40px]">
          {description}
        </p>
      </div>

      <div className="flex-1 border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-950/50">
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <Button
          fullWidth
          variant="contained"
          disableElevation
          disabled={isExporting || disabled}
          onClick={onExport}
          startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownloadOutlinedIcon />}
          sx={{
            py: 1.5,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
          }}
        >
          {isExporting ? "Queuing..." : exportText}
        </Button>
      </div>
    </div>
  );
};
