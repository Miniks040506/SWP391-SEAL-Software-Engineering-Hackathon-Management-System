import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import {
  TextField,
  Button,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { submissionApi } from "@/api/submission.api";
import {
  useBeginSubmissionResubmissionMutation,
  useParticipantSubmissionData,
  useSaveSubmissionDraftMutation,
  useSubmissionAttemptsQuery,
  useSubmissionRequirementsQuery,
  useSubmitExistingSubmissionMutation,
} from "../hooks/useParticipantSubmissionQueries";
import { SubmissionRequirementsPanel } from "../components/SubmissionRequirementsPanel";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import { SubmissionHistoryTable } from "../components/SubmissionHistoryTable";
import { SubmissionLinksPreview } from "../components/SubmissionLinksPreview";
import { GoogleDriveAttachmentPanel } from "../components/GoogleDriveAttachmentPanel";
import { GithubRepositoryPanel } from "../components/GithubRepositoryPanel";
import { filterTextFieldSx } from "../schemas/submissions.schema";
import {
  githubCallbackError,
  googleDriveCallbackError,
} from "../utils/integrationOAuthPopup";
import type {
  CreateSubmissionLinkRequest,
  SubmissionLinkType,
  SubmissionLinkResponse,
  SubmissionUploadPolicyResponse,
} from "@/types/submission.types";
import "../styles/submissionForm.css";

type StorageItem = {
  id: string;
  name: string;
  file?: File;
  size: number;
  lastModified: number;
  linkType?: SubmissionLinkType;
};

type ResourceLinkDraft = {
  clientId: string;
  linkType: SubmissionLinkType;
  url: string;
  label: string;
};

type DeleteTarget =
  | { kind: "staged"; id: string | "selected" }
  | { kind: "persisted"; link: SubmissionLinkResponse };

type UploadProgress = {
  current: number;
  total: number;
  fileName: string;
};

function createResourceLinkDraft(): ResourceLinkDraft {
  return {
    clientId: crypto.randomUUID(),
    linkType: "OTHER",
    url: "",
    label: "Resource Link",
  };
}

function getHttpUrlError(url: string): string | null {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  try {
    const parsed = new URL(trimmedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must start with http:// or https://.";
    }
    if (!parsed.hostname) {
      return "URL must include a host.";
    }
    return null;
  } catch {
    return "Enter a valid URL.";
  }
}

function formatDate(ts: number): string {
  const date = new Date(ts);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month} ${year}, ${time}`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function getExt(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "FILE") : "FILE";
}

function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
}

function getFilePolicyError(
  file: File,
  policy: SubmissionUploadPolicyResponse,
): string | null {
  const mimeType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);
  const acceptedMimeTypes = policy.acceptedMimeTypes.map((type) =>
    type.toLowerCase(),
  );
  const acceptedExtensions = policy.acceptedExtensions.map((ext) =>
    ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
  );

  if (
    !acceptedMimeTypes.includes(mimeType) ||
    !acceptedExtensions.includes(extension)
  ) {
    return `${file.name} is unsupported. Allowed extensions: ${acceptedExtensions.join(", ")}.`;
  }
  if (file.size > policy.maximumFileSizeBytes) {
    return `${file.name} exceeds the ${formatSize(policy.maximumFileSizeBytes)} limit.`;
  }
  return null;
}


export function SubmissionFormPage() {
  const { teamId, roundId } = useParams<{ teamId: string; roundId: string }>();
  const navigate = useNavigate();

  const { submission, loading, refetch } =
    useParticipantSubmissionData(teamId, roundId);
  const requirementsQuery = useSubmissionRequirementsQuery(teamId, roundId);
  const attemptsQuery = useSubmissionAttemptsQuery(submission?.id);
  const saveDraftMutation = useSaveSubmissionDraftMutation(teamId, roundId);
  const beginResubmissionMutation = useBeginSubmissionResubmissionMutation();

  const submitExistingSubmissionMutation =
    useSubmitExistingSubmissionMutation();

  const [items, setItems] = useState<StorageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [links, setLinks] = useState<ResourceLinkDraft[]>(() => [
    createResourceLinkDraft(),
  ]);
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  const [dragActive, setDragActive] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [attachmentSource, setAttachmentSource] = useState<
    "LOCAL_FILE" | "GOOGLE_DRIVE" | "GITHUB"
  >("LOCAL_FILE");
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempLinkType, setTempLinkType] = useState<SubmissionLinkType | "">("");
  const [tempSaveAs, setTempSaveAs] = useState("");
  const pickerFileInputRef = useRef<HTMLInputElement>(null);
  const userHasEdited = useRef(false);
  const submitInFlight = useRef(false);

  const [editItem, setEditItem] = useState<StorageItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editLinkType, setEditLinkType] = useState<SubmissionLinkType | "">("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deletingEvidence, setDeletingEvidence] = useState(false);
  const [editEvidenceTarget, setEditEvidenceTarget] = useState<SubmissionLinkResponse | null>(null);
  const [editEvidenceType, setEditEvidenceType] = useState<SubmissionLinkType>("OTHER");
  const [editEvidenceLabel, setEditEvidenceLabel] = useState("");
  const [editEvidencePrimary, setEditEvidencePrimary] = useState(false);
  const [editEvidenceOrder, setEditEvidenceOrder] = useState("0");
  const [editEvidenceError, setEditEvidenceError] = useState<string | null>(null);
  const [savingEvidenceMetadata, setSavingEvidenceMetadata] = useState(false);
  const [shakingLinks, setShakingLinks] = useState<Set<number>>(new Set());
  const previousLinkErrors = useRef<Array<string | null>>([]);

  useEffect(() => {
    const callbackUrl = new URL(window.location.href);
    const driveResult = callbackUrl.searchParams.get("googleDrive");
    const githubResult = callbackUrl.searchParams.get("github");
    if (!driveResult && !githubResult) return;

    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      if (driveResult === "connected") {
        setSuccessMsg(
          "Google Drive connected. Open Add Attachment to choose a file.",
        );
      } else if (driveResult) {
        setErrorMsg(
          googleDriveCallbackError(callbackUrl.searchParams.get("code")),
        );
      } else if (githubResult === "connected") {
        const privateAccess = callbackUrl.searchParams.get("privateRepositories") === "true";
        setSuccessMsg(
          `GitHub connected${privateAccess ? " with private repository access" : " for public repositories"}. Open Add Attachment to choose a repository.`,
        );
      } else {
        setErrorMsg(githubCallbackError(callbackUrl.searchParams.get("code")));
      }
    });
    callbackUrl.searchParams.delete("googleDrive");
    callbackUrl.searchParams.delete("github");
    callbackUrl.searchParams.delete("code");
    callbackUrl.searchParams.delete("privateRepositories");
    window.history.replaceState(
      null,
      "",
      `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`,
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || userHasEdited.current) return;
      const urlLinks = (submission?.links ?? []).filter(
        (link) => !link.objectKey && !link.providerResourceId,
      );
      setLinks(
        urlLinks.length > 0
          ? urlLinks.map((link) => ({
              clientId: link.id,
              linkType: link.linkType as SubmissionLinkType,
              url: link.url,
              label: link.label || "Resource Link",
            }))
          : [createResourceLinkDraft()],
      );
      setNote(submission?.note ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [submission]);

  const canEdit = requirementsQuery.data?.canEdit ?? false;
  const canSubmit = requirementsQuery.data?.canSubmit ?? false;
  const canBeginResubmission =
    requirementsQuery.data?.blockedReason === "SUBMISSION_RESUBMISSION_REQUIRED";
  const blockedReason = requirementsQuery.isError
    ? "Submission requirements could not be loaded. Retry before making changes."
    : requirementsQuery.data?.blockedMessage;
  const uploadPolicy = requirementsQuery.data?.uploadPolicy;
  const linkTypeOptions = requirementsQuery.data?.requirements ?? [];
  const localFileTypeOptions = linkTypeOptions.filter((requirement) =>
    requirement.allowedSources.includes("LOCAL_FILE"),
  );
  const localFileAvailability = requirementsQuery.data?.providerAvailability.find(
    (provider) => provider.source === "LOCAL_FILE",
  );
  const driveAvailability = requirementsQuery.data?.providerAvailability.find(
    (provider) => provider.source === "GOOGLE_DRIVE",
  );
  const githubAvailability = requirementsQuery.data?.providerAvailability.find(
    (provider) => provider.source === "GITHUB",
  );
  const canUploadLocalFile = canEdit && localFileAvailability?.available === true;

  // The dialog had no keyboard dismissal; Escape is the expected escape route.
  useEffect(() => {
    if (!isPickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPickerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPickerOpen]);

  const attachmentTabs = [
    {
      id: "LOCAL_FILE" as const,
      label: "Upload a file",
      icon: <UploadFileOutlinedIcon style={{ fontSize: 18 }} />,
      disabled: !canUploadLocalFile,
      hint: localFileAvailability?.message || "Upload a local file",
    },
    {
      id: "GOOGLE_DRIVE" as const,
      label: "Google Drive",
      icon: <CloudOutlinedIcon style={{ fontSize: 18 }} />,
      disabled: false,
      hint: driveAvailability?.message || "Choose from Google Drive",
    },
    {
      id: "GITHUB" as const,
      label: "GitHub",
      icon: <GitHubIcon style={{ fontSize: 18 }} />,
      disabled: false,
      hint: githubAvailability?.message || "Choose a GitHub repository",
    },
  ];
  const canOpenAttachmentDialog =
    canEdit &&
    (localFileAvailability?.available === true ||
      driveAvailability?.available === true ||
      githubAvailability?.available === true);
  const managedGithubLink = (submission?.links ?? []).find(
    (link) =>
      link.storageProvider === "GITHUB" &&
      Boolean(link.providerResourceId && link.repoMetadata?.commitSha),
  );
  const uploadAccept = uploadPolicy
    ? [...uploadPolicy.acceptedMimeTypes, ...uploadPolicy.acceptedExtensions].join(",")
    : undefined;
  const persistedFileCount = (submission?.links ?? []).filter(
    (link) => Boolean(link.objectKey) || link.fileSizeBytes != null,
  ).length;
  const pendingFileCount = items.filter((item) => item.file).length;

  const validateLocalFiles = (files: File[]): string | null => {
    if (!localFileAvailability?.available) {
      return localFileAvailability?.message || "Local file upload is unavailable.";
    }
    if (!uploadPolicy) {
      return "Upload limits are still loading. Try again.";
    }
    if (
      persistedFileCount + pendingFileCount + files.length >
      uploadPolicy.maximumFiles
    ) {
      return `A submission can contain at most ${uploadPolicy.maximumFiles} files.`;
    }
    for (const file of files) {
      const error = getFilePolicyError(file, uploadPolicy);
      if (error) return error;
    }
    return null;
  };

  const validateStagedFileTypes = (): boolean => {
    const untypedFile = items.find((item) => item.file && !item.linkType);
    if (!untypedFile) return true;
    setErrorMsg(`Select a submission type for ${untypedFile.name}.`);
    return false;
  };

  const submissionTypeLabel = (linkType?: SubmissionLinkType) =>
    linkTypeOptions.find((option) => option.type === linkType)?.label ||
    "Select type";

  const linkUrlErrors = useMemo(
    () => links.map((link) => getHttpUrlError(link.url)),
    [links],
  );

  useEffect(() => {
    const entered = linkUrlErrors
      .map((error, index) =>
        error && !previousLinkErrors.current[index] ? index : -1,
      )
      .filter((index) => index >= 0);
    previousLinkErrors.current = linkUrlErrors;
    if (entered.length === 0) return;
    const frame = requestAnimationFrame(() => setShakingLinks(new Set(entered)));
    const timer = window.setTimeout(() => setShakingLinks(new Set()), 320);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [linkUrlErrors]);

  const generateId = () => crypto.randomUUID();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && canEdit) {
      const files = Array.from(e.dataTransfer.files);
      const validationError = validateLocalFiles(files);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }

      const newItems: StorageItem[] = files.map((f) => ({
        id: generateId(),
        name: f.name,
        file: f,
        size: f.size,
        lastModified: f.lastModified,
      }));
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const openPicker = () => {
    if (!canEdit) return;
    if (!canOpenAttachmentDialog) {
      setErrorMsg(
        localFileAvailability?.message ||
          driveAvailability?.message ||
          githubAvailability?.message ||
          "File providers are unavailable.",
      );
      return;
    }
    setAttachmentSource(localFileAvailability?.available
      ? "LOCAL_FILE"
      : driveAvailability?.available
        ? "GOOGLE_DRIVE"
        : "GITHUB");
    setTempSaveAs("");
    setTempFile(null);
    setTempLinkType("");
    setIsPickerOpen(true);
  };

  const handleModalUpload = () => {
    if (tempFile) {
      if (!tempLinkType) {
        setErrorMsg("Select a submission type for this file.");
        return;
      }
      const validationError = validateLocalFiles([tempFile]);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }

      const finalName = tempSaveAs.trim() || tempFile.name;
      const fileToSave = new File([tempFile], finalName, {
        type: tempFile.type,
      });

      const newItem: StorageItem = {
        id: generateId(),
        name: finalName,
        file: fileToSave,
        size: fileToSave.size,
        lastModified: fileToSave.lastModified,
        linkType: tempLinkType,
      };

      setItems((prev) => [...prev, newItem]);
      setIsPickerOpen(false);
    }
  };

  const openEditModal = (item: StorageItem) => {
    if (!canEdit) return;
    setEditItem(item);
    setEditName(item.name);
    setEditLinkType(item.linkType ?? "");
  };

  const saveEdit = () => {
    if (editItem) {
      if (!editLinkType) {
        setErrorMsg("Select a submission type for this file.");
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                name: editName,
                linkType: editLinkType,
              }
            : i,
        ),
      );
      setEditItem(null);
    }
  };

  const confirmDelete = (target: string | "selected") => {
    setDeleteTarget({ kind: "staged", id: target });
    setIsDeleteModalOpen(true);
  };

  const confirmPersistedDelete = (link: SubmissionLinkResponse) => {
    setDeleteTarget({ kind: "persisted", link });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deletingEvidence) return;
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const openEvidenceEditor = (link: SubmissionLinkResponse) => {
    setEditEvidenceTarget(link);
    setEditEvidenceType(link.linkType as SubmissionLinkType);
    setEditEvidenceLabel(link.label || "");
    setEditEvidencePrimary(Boolean(link.isPrimary));
    setEditEvidenceOrder(String(link.displayOrder ?? 0));
    setEditEvidenceError(null);
  };

  const closeEvidenceEditor = () => {
    if (savingEvidenceMetadata) return;
    setEditEvidenceTarget(null);
    setEditEvidenceError(null);
  };

  const saveEvidenceMetadata = async () => {
    if (!editEvidenceTarget) return;
    const displayOrder = Number(editEvidenceOrder);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setEditEvidenceError("Display order must be a non-negative whole number.");
      return;
    }
    if (editEvidenceType === "OTHER" && !editEvidenceLabel.trim()) {
      setEditEvidenceError("A label is required for OTHER evidence.");
      return;
    }

    setSavingEvidenceMetadata(true);
    setEditEvidenceError(null);
    try {
      await submissionApi.updateSubmissionLinkMetadata(editEvidenceTarget.id, {
        linkType: editEvidenceType,
        label: editEvidenceLabel.trim(),
        isPrimary: editEvidencePrimary,
        displayOrder,
      });
      await Promise.all([refetch(), requirementsQuery.refetch()]);
      setEditEvidenceTarget(null);
      setSuccessMsg("Saved evidence metadata updated.");
    } catch (error) {
      setEditEvidenceError(
        (error as { message?: string })?.message || "Evidence metadata could not be updated.",
      );
    } finally {
      setSavingEvidenceMetadata(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "persisted") {
      setDeletingEvidence(true);
      setErrorMsg(null);
      try {
        await submissionApi.deleteSubmissionLink(deleteTarget.link.id);
        await Promise.all([refetch(), requirementsQuery.refetch()]);
        setSuccessMsg("Saved evidence deleted.");
      } catch (error) {
        setErrorMsg((error as { message?: string })?.message || "Saved evidence could not be deleted.");
        return;
      } finally {
        setDeletingEvidence(false);
      }
    } else if (deleteTarget.id === "selected") {
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } else {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setSelectedIds(
        new Set(
          [...selectedIds].filter((selectedId) => selectedId !== deleteTarget.id),
        ),
      );
      setEditItem(null);
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const toggleSelectAll = (visibleIds: string[]) => {
    if (selectedIds.size === visibleIds.length && visibleIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const buildLinks = (): CreateSubmissionLinkRequest[] => {
    const enteredLinks = links.filter((link) => link.url.trim() !== "");
    const primaryType = linkTypeOptions.find((requirement) => requirement.primary)?.type;

    return enteredLinks
      .map((l, idx) => ({
        linkType: l.linkType,
        label: l.label.trim() || "Resource Link",
        url: l.url.trim(),
        isPrimary:
          l.linkType === primaryType &&
          enteredLinks.findIndex((candidate) => candidate.linkType === l.linkType) === idx,
        displayOrder: idx,
      }));
  };

  const validateEnteredLinks = () => {
    const invalidIndex = linkUrlErrors.findIndex(Boolean);
    if (invalidIndex >= 0) {
      setErrorMsg(`Link ${invalidIndex + 1}: ${linkUrlErrors[invalidIndex]}`);
      return false;
    }
    return true;
  };

  const uploadStagedFiles = async (submissionId: string) => {
    const stagedFiles = items.filter(
      (item): item is StorageItem & { file: File; linkType: SubmissionLinkType } =>
        Boolean(item.file && item.linkType),
    );
    let uploadedCount = 0;

    try {
      for (const [index, item] of stagedFiles.entries()) {
        setUploadProgress({
          current: index + 1,
          total: stagedFiles.length,
          fileName: item.name,
        });

        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("linkType", item.linkType);
        formData.append("label", item.name);
        formData.append("isPrimary", "false");

        await submissionApi.uploadFileToSubmission(submissionId, formData);
        uploadedCount += 1;
        setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      }
    } catch (error) {
      await Promise.all([refetch(), requirementsQuery.refetch()]);
      const remainingCount = stagedFiles.length - uploadedCount;
      const detail = (error as { message?: string })?.message || "File upload failed.";
      throw new Error(
        `${uploadedCount} of ${stagedFiles.length} files uploaded; ${remainingCount} remain staged. ${detail}`,
        { cause: error },
      );
    } finally {
      setUploadProgress(null);
    }
  };

  const handleBeginResubmission = async () => {
    if (!submission || !canBeginResubmission) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await beginResubmissionMutation.mutateAsync(submission.id);
      await Promise.all([refetch(), requirementsQuery.refetch()]);
      setSuccessMsg(`Attempt #${submission.submissionNumber + 1} is ready as a draft.`);
    } catch (error) {
      setErrorMsg(
        (error as { message?: string })?.message || "Could not begin the resubmission.",
      );
    }
  };

  const handleSaveDraft = async () => {
    if (!teamId || !roundId) return;
    if (!canEdit) {
      setErrorMsg(blockedReason || "This submission is read-only.");
      return;
    }
    if (!validateEnteredLinks()) return;
    if (!validateStagedFileTypes()) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const savedDraft = await saveDraftMutation.mutateAsync({
        links: buildLinks(),
        note: note.trim() || undefined,
      });
      const currentSubId = savedDraft.id;

      await uploadStagedFiles(currentSubId);
      userHasEdited.current = false;
      await Promise.all([refetch(), requirementsQuery.refetch()]);
      setSuccessMsg("Draft saved successfully.");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorMsg(
        msg?.includes("ROUND_SUBMISSION_LOCKED") ||
          msg?.toLowerCase().includes("locked")
          ? "Submissions are locked for this round."
          : msg || "Failed to save draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!teamId || !roundId || submitInFlight.current) return;
    if (!canSubmit) {
      setErrorMsg(blockedReason || "This submission is read-only.");
      return;
    }

    const actualFiles = items;
    const validLinks = links.filter((l) => l.url.trim() !== "");
    const existingProviderEvidence = (submission?.links ?? []).filter((l) =>
      Boolean(l.objectKey || l.providerResourceId),
    );
    if (validLinks.length === 0 && actualFiles.length === 0 && existingProviderEvidence.length === 0) {
      setErrorMsg("Please provide at least a link or upload a file.");
      return;
    }
    if (!validateEnteredLinks()) return;
    if (!validateStagedFileTypes()) return;

    submitInFlight.current = true;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const savedDraft = await saveDraftMutation.mutateAsync({
        links: buildLinks(),
        note: note.trim() || undefined,
      });
      const currentSubId = savedDraft.id;

      await uploadStagedFiles(currentSubId);
      const finalized = await submitExistingSubmissionMutation.mutateAsync(currentSubId);
      if (finalized.status !== "SUBMITTED" && finalized.status !== "LATE") {
        throw new Error("The server did not persist a final submission status.");
      }

      userHasEdited.current = false;
      await Promise.all([refetch(), requirementsQuery.refetch()]);
      setSuccessMsg(`Submission confirmed with ${finalized.status} status.`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorMsg(
        msg?.includes("ROUND_SUBMISSION_LOCKED") ||
          msg?.toLowerCase().includes("locked")
          ? "Submissions are locked for this round."
          : msg?.includes("deadline")
            ? "Deadline exceeded. Submission is blocked."
            : msg || "Failed to submit.",
      );
    } finally {
      submitInFlight.current = false;
      setSubmitting(false);
    }
  };

  const currentItems = items;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        Loading...
      </div>
    );

  return (
    <div className="flex-1 min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="sf-head mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-3 flex items-center gap-1.5 transition-colors"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
                Round Submission
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage deliverables for your team.
              </p>
            </div>
            {submission && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SubmissionStatusBadge status={submission.status} />
                {canBeginResubmission && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={beginResubmissionMutation.isPending || saving || submitting}
                    onClick={handleBeginResubmission}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    {beginResubmissionMutation.isPending ? "Preparing..." : "Resubmit"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {requirementsQuery.isLoading && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading submission requirements…
          </div>
        )}
        {requirementsQuery.isError && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <span>Submission requirements could not be loaded. Editing is disabled.</span>
            <Button size="small" onClick={() => requirementsQuery.refetch()}>
              Retry
            </Button>
          </div>
        )}
        {requirementsQuery.data && (
          <div className="mb-6">
            <SubmissionRequirementsPanel requirements={requirementsQuery.data} />
          </div>
        )}

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-6">
          {(["form", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-0.5 ${activeTab === tab ? "text-blue-600 dark:text-blue-400 border-blue-600" : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              {tab === "form" ? "Submit Deliverables" : "Submission History"}
            </button>
          ))}
        </div>

        {activeTab === "history" ? (
          <SubmissionHistoryTable
            history={attemptsQuery.data ?? []}
            loading={attemptsQuery.isLoading}
            error={attemptsQuery.error}
            onRetry={() => void attemptsQuery.refetch()}
          />
        ) : (
          <div className="space-y-6">
            {/* Evidence — what the team has filed, and how to add more */}
            <section style={{ "--delay": "0ms" } as React.CSSProperties} className="sf-section rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                <div className="min-w-0">
                  <h2 className="sf-heading text-base font-bold text-slate-900 dark:text-white">
                    Evidence &amp; files
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Attach the deliverables that satisfy each required type above.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={openPicker}
                      disabled={!canOpenAttachmentDialog}
                      title={
                        canOpenAttachmentDialog
                          ? "Add attachment"
                          : localFileAvailability?.message ||
                            driveAvailability?.message ||
                            githubAvailability?.message ||
                            "Attachment providers are unavailable"
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
                    >
                      <AddRoundedIcon style={{ fontSize: 18 }} />
                      Add evidence
                    </button>
                  )}
                  {canEdit && (
                    <span className="text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
                      {uploadPolicy
                        ? `Up to ${formatSize(uploadPolicy.maximumFileSizeBytes)} · ${persistedFileCount}/${uploadPolicy.maximumFiles} files`
                        : "Loading upload limits…"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {submission?.links && submission.links.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Saved submission items
                    </h3>
                    <SubmissionLinksPreview
                      links={submission.links}
                      canDelete={canEdit}
                      canEdit={canEdit}
                      deletingLinkId={
                        deleteTarget?.kind === "persisted" && deletingEvidence
                          ? deleteTarget.link.id
                          : null
                      }
                      onDelete={confirmPersistedDelete}
                      onEdit={openEvidenceEditor}
                    />
                  </div>
                )}

                {uploadProgress && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="sf-upload flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                  >
                    <CloudUploadOutlinedIcon style={{ fontSize: 18 }} />
                    <span className="tabular-nums">
                      Uploading {uploadProgress.current} of {uploadProgress.total}:
                    </span>
                    <span className="truncate">{uploadProgress.fileName}</span>
                  </div>
                )}

                {canEdit ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (currentItems.length === 0) openPicker();
                    }}
                    className={[
                      `sf-drop rounded-xl border-2 border-dashed transition-colors ${dragActive ? "sf-drop-active" : ""}`,
                      dragActive
                        ? "border-blue-400 bg-blue-50/70 dark:border-blue-500/70 dark:bg-blue-500/10"
                        : "border-slate-300 dark:border-slate-700",
                      currentItems.length === 0
                        ? "cursor-pointer hover:border-blue-400 hover:bg-slate-50 dark:hover:border-blue-500/60 dark:hover:bg-slate-800/50"
                        : "bg-slate-50/50 dark:bg-slate-900/40",
                    ].join(" ")}
                  >
                    {currentItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                          <CloudUploadOutlinedIcon style={{ fontSize: 24 }} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Drag &amp; drop files here
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            or click to choose a file, Google Drive, or GitHub source
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-2 flex items-center justify-between px-1">
                          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <input
                              type="checkbox"
                              checked={
                                selectedIds.size === currentItems.length &&
                                currentItems.length > 0
                              }
                              onChange={() =>
                                toggleSelectAll(currentItems.map((i) => i.id))
                              }
                              className="cursor-pointer rounded border-slate-300 bg-transparent text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                            />
                            <span className="tabular-nums">
                              {currentItems.length} file
                              {currentItems.length > 1 ? "s" : ""} ready to upload
                            </span>
                          </label>
                          {selectedIds.size > 0 && (
                            <button
                              type="button"
                              onClick={() => confirmDelete("selected")}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            >
                              <DeleteOutlineRoundedIcon style={{ fontSize: 16 }} />
                              Remove selected
                            </button>
                          )}
                        </div>
                        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                          {currentItems.map((item) => (
                            <li
                              key={item.id}
                              className={`sf-row-in flex items-center gap-3 p-3 transition-colors ${selectedIds.has(item.id) ? "bg-blue-50/60 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="cursor-pointer rounded border-slate-300 bg-transparent text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                              />
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <InsertDriveFileOutlinedIcon style={{ fontSize: 18 }} />
                              </span>
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                  {formatSize(item.size)} · {submissionTypeLabel(item.linkType)}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDelete(item.id)}
                                aria-label={`Remove ${item.name}`}
                                className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                              >
                                <DeleteOutlineRoundedIcon style={{ fontSize: 18 }} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 px-1 text-xs text-slate-400 dark:text-slate-500">
                          Drop more files here, or use “Add evidence”.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  (!submission?.links || submission.links.length === 0) && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                      No evidence was attached to this submission.
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Resource links — an editing surface; saved URLs appear above */}
            {canEdit && (
              <section style={{ "--delay": "80ms" } as React.CSSProperties} className="sf-section rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <h2 className="sf-heading text-base font-bold text-slate-900 dark:text-white">
                  Resource links
                </h2>
                <p className="mt-1 mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Add external URLs — a repository, deployed demo, or shared document.
                </p>
                <div className="flex flex-col gap-3">
                  {links.map((link, idx) => (
                    <div
                      key={link.clientId}
                      className={`sf-row-in flex flex-col gap-3 sm:flex-row sm:items-start ${shakingLinks.has(idx) ? "sf-error-shake" : ""}`}
                    >
                      <TextField
                        select
                        size="small"
                        label="Submission type"
                        disabled={!canEdit}
                        value={linkTypeOptions.length > 0 ? link.linkType : ""}
                        onChange={(e) => {
                          userHasEdited.current = true;
                          const newLinks = [...links];
                          newLinks[idx].linkType = e.target.value as SubmissionLinkType;
                          setLinks(newLinks);
                        }}
                        sx={{ ...filterTextFieldSx, minWidth: 180 }}
                      >
                        {linkTypeOptions.map((option) => (
                          <MenuItem key={option.type} value={option.type}>
                            {option.label}{option.required ? " (Required)" : ""}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        size="small"
                        type="url"
                        disabled={!canEdit}
                        value={link.url}
                        onChange={(e) => {
                          userHasEdited.current = true;
                          const newLinks = [...links];
                          newLinks[idx].url = e.target.value;
                          setLinks(newLinks);
                        }}
                        placeholder="https://github.com/... or any external link"
                        error={Boolean(linkUrlErrors[idx])}
                        helperText={
                          linkUrlErrors[idx] ??
                          "Only http:// and https:// links are accepted."
                        }
                        sx={filterTextFieldSx}
                      />
                      <TextField
                        size="small"
                        disabled={!canEdit}
                        value={link.label}
                        onChange={(e) => {
                          userHasEdited.current = true;
                          const newLinks = [...links];
                          newLinks[idx].label = e.target.value;
                          setLinks(newLinks);
                        }}
                        placeholder="Label (e.g. GitHub Repo)"
                        sx={{ ...filterTextFieldSx, minWidth: 200 }}
                      />
                      {links.length > 1 && canEdit && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            userHasEdited.current = true;
                            setLinks(links.filter((_, i) => i !== idx));
                          }}
                          sx={{
                            height: 40,
                            minWidth: 40,
                            padding: 0,
                            borderRadius: "10px",
                          }}
                          aria-label={`Remove link ${idx + 1}`}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}
                  <div>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        userHasEdited.current = true;
                        setLinks([...links, createResourceLinkDraft()]);
                      }}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "10px",
                        height: 40,
                      }}
                    >
                      + Add Link
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Note to reviewers */}
            {(canEdit || note.trim().length > 0) && (
              <section style={{ "--delay": "160ms" } as React.CSSProperties} className="sf-section rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <h2 className="sf-heading text-base font-bold text-slate-900 dark:text-white">
                  Note to reviewers
                </h2>
                <p className="mt-1 mb-4 text-sm text-slate-500 dark:text-slate-400">
                  Optional context to help judges review your submission.
                </p>
                {canEdit ? (
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    value={note}
                    onChange={(e) => {
                      userHasEdited.current = true;
                      setNote(e.target.value);
                    }}
                    placeholder="Context or notes for reviewers..."
                    disabled={!canEdit}
                    sx={filterTextFieldSx}
                  />
                ) : (
                  <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
                    {note}
                  </p>
                )}
              </section>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircleOutlineRoundedIcon
                  style={{ fontSize: 18 }}
                  className="sf-success-icon mt-0.5 shrink-0"
                />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                <ErrorOutlineRoundedIcon
                  style={{ fontSize: 18 }}
                  className="mt-0.5 shrink-0"
                />
                <span>{errorMsg}</span>
              </div>
            )}

            {canEdit && (
              <div className="sf-action sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outlined"
                    onClick={handleSaveDraft}
                    disabled={saving || submitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      height: 40,
                      borderColor: "#3b82f6",
                      color: "#3b82f6",
                      "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                      ".dark &": {
                        borderColor: "#3b82f6",
                        color: "#60a5fa",
                        "&:hover": {
                          borderColor: "#60a5fa",
                          bgcolor: "rgba(59, 130, 246, 0.1)",
                        },
                      },
                    }}
                  >
                    {saving && <CircularProgress size={15} sx={{ mr: 1 }} />}
                    {saving ? "Saving..." : "Draft"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={saving || submitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      height: 40,
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                      "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                      ".dark &": {
                        borderColor: "#334155",
                        color: "#94a3b8",
                        "&:hover": {
                          borderColor: "#475569",
                          bgcolor: "#1e293b",
                        },
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {!canSubmit && blockedReason && (
                    <span className="hidden max-w-xs text-right text-xs font-medium text-slate-500 dark:text-slate-400 sm:inline">
                      {blockedReason}
                    </span>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={submitting || saving || !canSubmit}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      boxShadow: "none",
                      height: 40,
                      bgcolor: "#3b82f6",
                      "&:hover": { bgcolor: "#2563eb" },
                    }}
                  >
                    {submitting && <CircularProgress size={15} color="inherit" sx={{ mr: 1 }} />}
                    {submitting ? "Submitting..." : "Submit Final"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            aria-hidden
            className="sf-backdrop absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsPickerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attachment-dialog-title"
            className="sf-dialog relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 pt-5 pb-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2
                    id="attachment-dialog-title"
                    className="text-lg font-bold tracking-tight text-gray-900 dark:text-white"
                  >
                    Add evidence
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                    Attach a file, or pull it straight from a connected account.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setIsPickerOpen(false)}
                  className="-mt-1 -mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <CloseRoundedIcon style={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Segmented control reads as one grouped choice, unlike three
                  detached underlines. */}
              <div
                role="tablist"
                aria-label="Evidence source"
                className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-slate-800"
              >
                {attachmentTabs.map((tab) => {
                  const active = attachmentSource === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      disabled={tab.disabled}
                      onClick={() => setAttachmentSource(tab.id)}
                      title={tab.hint}
                      className={[
                        "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
                        active
                          ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                          : "text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100",
                      ].join(" ")}
                    >
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {attachmentSource === "GITHUB" ? (
                <GithubRepositoryPanel
                  teamId={teamId}
                  roundId={roundId}
                  canEdit={canEdit}
                  availability={githubAvailability}
                  existingLink={managedGithubLink}
                  onError={setErrorMsg}
                  onSaved={async () => {
                    await Promise.all([refetch(), requirementsQuery.refetch()]);
                    setSuccessMsg("GitHub repository snapshot saved.");
                    setIsPickerOpen(false);
                  }}
                />
              ) : attachmentSource === "GOOGLE_DRIVE" ? (
                <GoogleDriveAttachmentPanel
                  teamId={teamId}
                  roundId={roundId}
                  canEdit={canEdit}
                  availability={driveAvailability}
                  requirements={linkTypeOptions}
                  uploadPolicy={uploadPolicy}
                  persistedFileCount={persistedFileCount}
                  onError={setErrorMsg}
                  onImported={async () => {
                    await Promise.all([refetch(), requirementsQuery.refetch()]);
                    setSuccessMsg("Google Drive evidence imported and snapshotted.");
                    setIsPickerOpen(false);
                  }}
                />
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex w-full flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                      File
                    </span>
                    {/* A drop target reads as the primary action here, where the
                        old bare "Choose File" button gave no affordance. */}
                    <button
                      type="button"
                      onClick={() => pickerFileInputRef.current?.click()}
                      className={[
                        "mt-1 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                        tempFile
                          ? "border-blue-400 bg-blue-50/60 dark:border-blue-500/60 dark:bg-blue-500/10"
                          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:border-slate-700 dark:hover:border-blue-500/60 dark:hover:bg-slate-800/60",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex size-11 items-center justify-center rounded-full",
                          tempFile
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                            : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400",
                        ].join(" ")}
                      >
                        <UploadFileOutlinedIcon style={{ fontSize: 22 }} />
                      </span>
                      {tempFile ? (
                        <>
                          <span className="max-w-full truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {tempFile.name}
                          </span>
                          <span className="text-xs font-medium text-gray-500 tabular-nums dark:text-slate-400">
                            {formatSize(tempFile.size)} · choose a different file
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Choose a file
                          </span>
                          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                            Up to {uploadPolicy ? formatSize(uploadPolicy.maximumFileSizeBytes) : "the round limit"}
                          </span>
                        </>
                      )}
                    </button>
                    <input
                      type="file"
                      accept={uploadAccept}
                      className="hidden"
                      ref={pickerFileInputRef}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          const validationError = validateLocalFiles([file]);
                          if (validationError) {
                            setErrorMsg(validationError);
                            e.target.value = "";
                            return;
                          }
                          setTempFile(file);
                          setTempSaveAs(file.name);
                        }
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                      Save as
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={tempSaveAs}
                      onChange={(e) => setTempSaveAs(e.target.value)}
                      sx={filterTextFieldSx}
                    />
                  </div>

                  <TextField
                    select
                    fullWidth
                    required
                    size="small"
                    label="Submission type"
                    value={tempLinkType}
                    onChange={(event) =>
                      setTempLinkType(event.target.value as SubmissionLinkType)
                    }
                    helperText="Choose what requirement this file satisfies."
                    sx={filterTextFieldSx}
                  >
                    {localFileTypeOptions.map((option) => (
                      <MenuItem key={option.type} value={option.type}>
                        {option.label}{option.required ? " (Required)" : ""}
                      </MenuItem>
                    ))}
                  </TextField>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="contained"
                      onClick={handleModalUpload}
                      disabled={!tempFile || !tempLinkType}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "10px",
                        boxShadow: "none",
                        height: 40,
                      }}
                    >
                      Upload this file
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setEditItem(null)}
          />
          <div className="sf-dialog relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-transparent">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                Edit {editItem.name}
              </h2>
              <button
                onClick={() => setEditItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex gap-3">
                <button
                  onClick={() => confirmDelete(editItem.id)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <TextField
                  fullWidth
                  size="small"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  sx={filterTextFieldSx}
                />
              </div>

              <TextField
                select
                fullWidth
                required
                size="small"
                label="Submission type"
                value={editLinkType}
                onChange={(event) =>
                  setEditLinkType(event.target.value as SubmissionLinkType)
                }
                helperText="Choose what requirement this file satisfies."
                sx={filterTextFieldSx}
              >
                {localFileTypeOptions.map((option) => (
                  <MenuItem key={option.type} value={option.type}>
                    {option.label}{option.required ? " (Required)" : ""}
                  </MenuItem>
                ))}
              </TextField>

              <div className="flex justify-end gap-3 pt-2 border-b border-slate-100 dark:border-slate-700 pb-6">
                <Button
                  variant="outlined"
                  onClick={() => setEditItem(null)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "10px",
                    height: 40,
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                    ".dark &": {
                      borderColor: "#334155",
                      color: "#94a3b8",
                      "&:hover": { borderColor: "#475569", bgcolor: "#1e293b" },
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={saveEdit}
                  disabled={!editLinkType}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "10px",
                    boxShadow: "none",
                    height: 40,
                  }}
                >
                  Update
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="w-18 h-20 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 shrink-0 relative">
                  <div className="absolute top-0 right-0 w-4.5 h-4.5 border-l border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-bl-md"></div>
                  <span className="text-[14px] font-black text-slate-800 dark:text-slate-300 mt-2">
                    {getExt(editItem.name)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex gap-4">
                    <span className="w-24 text-slate-500 dark:text-slate-400 font-medium">
                      Last modified
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatDate(editItem.lastModified)}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-24 text-slate-500 dark:text-slate-400 font-medium">
                      Size
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatSize(editItem.size)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={isDeleteModalOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          transition: { timeout: 240 },
          paper: { className: "sf-dialog" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm deletion</DialogTitle>
        <DialogContent dividers>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Delete {deleteTarget?.kind === "persisted"
              ? deleteTarget.link.originalFileName || deleteTarget.link.label || "this saved evidence"
              : deleteTarget?.id === "selected" ? "the selected items" : "this staged item"}?
            {deleteTarget?.kind === "persisted" &&
              (deleteTarget.link.storageProvider === "AWS_S3" || deleteTarget.link.objectKey) &&
              " Its stored file will also be removed."}
            {" This action cannot be undone."}
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            disabled={deletingEvidence}
            onClick={closeDeleteDialog}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deletingEvidence || !deleteTarget}
            onClick={executeDelete}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {deletingEvidence ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editEvidenceTarget)}
        onClose={closeEvidenceEditor}
        fullWidth
        maxWidth="sm"
        slotProps={{
          transition: { timeout: 240 },
          paper: { className: "sf-dialog" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit saved evidence</DialogTitle>
        <DialogContent dividers>
          <div className="grid gap-4 pt-1 sm:grid-cols-2">
            <TextField
              select
              fullWidth
              label="Submission type"
              value={editEvidenceType}
              onChange={(event) => setEditEvidenceType(event.target.value as SubmissionLinkType)}
            >
              {linkTypeOptions.map((option) => (
                <MenuItem key={option.type} value={option.type}>
                  {option.label}{option.required ? " (Required)" : ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Display label"
              required={editEvidenceType === "OTHER"}
              value={editEvidenceLabel}
              onChange={(event) => setEditEvidenceLabel(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
            <TextField
              fullWidth
              type="number"
              label="Display order"
              value={editEvidenceOrder}
              onChange={(event) => setEditEvidenceOrder(event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editEvidencePrimary}
                  onChange={(event) => setEditEvidencePrimary(event.target.checked)}
                />
              }
              label="Primary evidence"
            />
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            File name, storage provider, object key, MIME type, size, and URL remain unchanged.
          </p>
          {editEvidenceError && (
            <p role="alert" className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
              {editEvidenceError}
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            disabled={savingEvidenceMetadata}
            onClick={closeEvidenceEditor}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={savingEvidenceMetadata || !editEvidenceTarget}
            onClick={saveEvidenceMetadata}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {savingEvidenceMetadata ? "Saving..." : "Save metadata"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
