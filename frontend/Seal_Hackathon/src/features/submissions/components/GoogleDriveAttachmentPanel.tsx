import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import {
  googleDriveApi,
  type GoogleDriveConnectionStatus,
} from "@/api/googleDrive.api";
import { submissionApi } from "@/api/submission.api";
import type {
  SubmissionLinkType,
  SubmissionProviderAvailabilityResponse,
  SubmissionRequirementItemResponse,
  SubmissionUploadPolicyResponse,
} from "@/types/submission.types";
import { filterTextFieldSx } from "../schemas/submissions.schema";
import {
  chooseGoogleDriveFile,
  type GooglePickerFile,
} from "../utils/googlePicker";

type Props = {
  teamId?: string;
  roundId?: string;
  canEdit: boolean;
  availability?: SubmissionProviderAvailabilityResponse;
  requirements: SubmissionRequirementItemResponse[];
  uploadPolicy?: SubmissionUploadPolicyResponse;
  persistedFileCount: number;
  onImported: () => void | Promise<void>;
  onError: (message: string) => void;
};

function requestMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function GoogleDriveAttachmentPanel({
  teamId,
  roundId,
  canEdit,
  availability,
  requirements,
  uploadPolicy,
  persistedFileCount,
  onImported,
  onError,
}: Props) {
  const [status, setStatus] = useState<GoogleDriveConnectionStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [action, setAction] = useState<
    "connect" | "disconnect" | "choose" | "import" | null
  >(null);
  const [selectedFile, setSelectedFile] = useState<GooglePickerFile | null>(null);
  const [linkType, setLinkType] = useState<SubmissionLinkType | "">("");
  const [label, setLabel] = useState("");

  const driveTypes = requirements.filter((requirement) =>
    requirement.allowedSources.includes("GOOGLE_DRIVE"),
  );
  const atFileLimit = Boolean(
    uploadPolicy && persistedFileCount >= uploadPolicy.maximumFiles,
  );
  const configured = availability?.available === true;

  useEffect(() => {
    if (!configured) return;
    let active = true;
    googleDriveApi
      .getStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .catch((error: unknown) => {
        if (active) {
          onError(requestMessage(error, "Google Drive status could not be loaded."));
        }
      })
      .finally(() => {
        if (active) setStatusLoading(false);
      });
    return () => {
      active = false;
    };
  }, [configured, onError]);

  const handleConnect = async () => {
    setAction("connect");
    try {
      const start = await googleDriveApi.connect(window.location.pathname);
      window.location.assign(start.authorizationUrl);
    } catch (error) {
      onError(requestMessage(error, "Google Drive connection could not start."));
      setAction(null);
    }
  };

  const handleDisconnect = async () => {
    setAction("disconnect");
    try {
      await googleDriveApi.disconnect();
      setStatus((current) =>
        current ? { ...current, connected: false, accountEmail: null } : current,
      );
      setSelectedFile(null);
    } catch (error) {
      onError(requestMessage(error, "Google Drive could not be disconnected."));
    } finally {
      setAction(null);
    }
  };

  const handleChoose = async () => {
    setAction("choose");
    try {
      const session = await googleDriveApi.getPickerSession();
      const selection = await chooseGoogleDriveFile(session);
      if (selection) {
        setSelectedFile(selection);
        setLabel(selection.name.slice(0, 200));
      }
    } catch (error) {
      onError(requestMessage(error, "Google Drive Picker could not be opened."));
    } finally {
      setAction(null);
    }
  };

  const handleImport = async () => {
    if (!teamId || !roundId || !selectedFile || !linkType) return;
    setAction("import");
    try {
      await submissionApi.importGoogleDriveFile(teamId, roundId, {
        fileId: selectedFile.fileId,
        linkType,
        label: label.trim() || selectedFile.name,
        isPrimary: false,
        displayOrder: persistedFileCount,
      });
      await onImported();
      setSelectedFile(null);
      setLinkType("");
      setLabel("");
    } catch (error) {
      onError(requestMessage(error, "Google Drive evidence could not be imported."));
    } finally {
      setAction(null);
    }
  };

  if (!configured) {
    return (
      <Alert severity="warning">
        {availability?.message ||
          "Google Drive is not configured. Ask an administrator to complete provider setup."}
      </Alert>
    );
  }

  if (statusLoading) {
    return <Alert severity="info">Checking Google Drive connection…</Alert>;
  }

  if (!status?.connected) {
    return (
      <div className="space-y-4">
        <Alert severity="info">
          Connect a separate Google Drive account to choose evidence. Your login
          authorization is not reused for Drive access.
        </Alert>
        <Button
          variant="contained"
          disabled={!canEdit || action !== null}
          onClick={handleConnect}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {action === "connect" ? "Connecting…" : "Connect Google Drive"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div>
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
            Google Drive connected
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            {status.accountEmail || "Connected account"}
          </p>
        </div>
        <Button
          size="small"
          color="inherit"
          disabled={action !== null}
          onClick={handleDisconnect}
        >
          {action === "disconnect" ? "Disconnecting…" : "Disconnect"}
        </Button>
      </div>

      {atFileLimit && uploadPolicy && (
        <Alert severity="warning">
          This draft already has the maximum {uploadPolicy.maximumFiles} stored files.
        </Alert>
      )}

      <TextField
        select
        fullWidth
        required
        size="small"
        label="Submission type"
        value={linkType}
        onChange={(event) => setLinkType(event.target.value as SubmissionLinkType)}
        helperText="Choose what requirement this Drive file satisfies."
        sx={filterTextFieldSx}
      >
        {driveTypes.map((option) => (
          <MenuItem key={option.type} value={option.type}>
            {option.label}{option.required ? " (Required)" : ""}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="outlined"
        disabled={!canEdit || action !== null || atFileLimit}
        onClick={handleChoose}
        sx={{ textTransform: "none", fontWeight: 700 }}
      >
        {action === "choose" ? "Opening Picker…" : "Choose from Google Drive"}
      </Button>

      {selectedFile && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">
              {selectedFile.mimeType || "File"}
              {selectedFile.sizeBytes != null
                ? ` · ${(selectedFile.sizeBytes / 1024 / 1024).toFixed(1)} MB`
                : ""}
            </p>
          </div>
          <TextField
            fullWidth
            size="small"
            label="Display label"
            value={label}
            onChange={(event) => setLabel(event.target.value.slice(0, 200))}
          />
          <Button
            variant="contained"
            disabled={!linkType || action !== null || atFileLimit}
            onClick={handleImport}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {action === "import" ? "Importing snapshot…" : "Import this file"}
          </Button>
        </div>
      )}
    </div>
  );
}
