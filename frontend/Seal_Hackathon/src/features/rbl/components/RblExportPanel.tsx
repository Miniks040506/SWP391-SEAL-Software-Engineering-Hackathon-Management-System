import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import { ExportStatusBadge } from "@/features/exports/components/ExportStatusBadge";
import {
  useCreateRblDatasetExport,
  useDownloadExport,
  useExportJobQuery,
} from "@/features/exports/hooks/useExports";
import type { UUID } from "@/types/common.types";
import type { ExportFormat } from "@/types/export.types";

type Props = {
  eventId: UUID;
  roundId?: UUID;
  trackId?: UUID;
  roundLabel?: string;
  trackLabel?: string;
};

export function RblExportPanel({
  eventId,
  roundId,
  trackId,
  roundLabel = "All rounds",
  trackLabel = "All tracks",
}: Props) {
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<UUID | null>(null);

  const createExportMutation = useCreateRblDatasetExport();
  const downloadMutation = useDownloadExport();
  const exportJobQuery = useExportJobQuery((createdJobId ?? "") as UUID);
  const exportJob = exportJobQuery.data ?? createExportMutation.data;
  const isCreating = createExportMutation.isPending;
  const isPolling =
    exportJob?.status === "QUEUED" || exportJob?.status === "PROCESSING";

  const handleFormatChange = (event: SelectChangeEvent) => {
    setFormat(event.target.value as ExportFormat);
  };

  const handleConfirmExport = () => {
    createExportMutation.mutate(
      {
        eventId,
        payload: {
          roundId,
          trackId,
          format,
        },
      },
      {
        onSuccess: (job) => {
          setCreatedJobId(job.id);
          setConfirmOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">Export anonymized RBL dataset</Typography>
              <Typography variant="body2" color="text.secondary">
                Includes raw score rows with anonymized team, submission, judge,
                and criterion identifiers.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scope: {roundLabel} / {trackLabel}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="rbl-export-format-label">Format</InputLabel>
                <Select
                  labelId="rbl-export-format-label"
                  value={format}
                  label="Format"
                  onChange={handleFormatChange}
                >
                  <MenuItem value="CSV">CSV</MenuItem>
                  <MenuItem value="XLSX">XLSX</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => setConfirmOpen(true)}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Export dataset"}
              </Button>
            </Box>
          </Box>

          {exportJob && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Latest export
                    </Typography>
                    <ExportStatusBadge status={exportJob.status} />
                    {isPolling && (
                      <Typography variant="caption" color="text.secondary">
                        Updating status...
                      </Typography>
                    )}
                  </Box>
                  {exportJob.fileName && (
                    <Typography variant="caption" color="text.secondary">
                      {exportJob.fileName}
                      {typeof exportJob.rowCount === "number"
                        ? ` • ${exportJob.rowCount} rows`
                        : ""}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  disabled={
                    exportJob.status !== "DONE" || downloadMutation.isPending
                  }
                  onClick={() => downloadMutation.mutate(exportJob.id)}
                >
                  {downloadMutation.isPending ? "Opening..." : "Download"}
                </Button>
              </Box>

              {exportJob.status === "FAILED" && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {exportJob.errorMessage || "Export failed. Please retry later."}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Export anonymized RBL dataset?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This creates a {format} dataset for {roundLabel} / {trackLabel}.
            Individual score rows are included, but team, submission, judge, and
            criterion identifiers are anonymized for RBL research use.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmExport}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create export"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
