import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { submissionApi } from "@/api/submission.api";
import {
  useParticipantSubmissionData,
  useSaveSubmissionDraftMutation,
  useSubmissionRequirementsQuery,
  useSubmitExistingSubmissionMutation,
} from "../hooks/useParticipantSubmissionQueries";
import { SubmissionRequirementsPanel } from "../components/SubmissionRequirementsPanel";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import { SubmissionHistoryTable } from "../components/SubmissionHistoryTable";
import { SubmissionLinksPreview } from "../components/SubmissionLinksPreview";
import { filterTextFieldSx } from "../schemas/submissions.schema";
import type {
  CreateSubmissionLinkRequest,
  SubmissionLinkType,
  SubmissionHistoryEntry,
  SubmissionLinkResponse,
  SubmissionUploadPolicyResponse,
} from "@/types/submission.types";

type StorageItem = {
  id: string;
  type: "file" | "folder";
  name: string;
  file?: File;
  size: number;
  lastModified: number;
  author: string;
  license: string;
  path: string;
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

  const { submission, teamInfo, loading, refetch } =
    useParticipantSubmissionData(teamId, roundId);
  const requirementsQuery = useSubmissionRequirementsQuery(teamId, roundId);
  const saveDraftMutation = useSaveSubmissionDraftMutation(teamId, roundId);

  const submitExistingSubmissionMutation =
    useSubmitExistingSubmissionMutation();

  const [items, setItems] = useState<StorageItem[]>([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"icon" | "list" | "tree">("icon");

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
  const [pickerTab, setPickerTab] = useState<"local" | "drive">("local");
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempLinkType, setTempLinkType] = useState<SubmissionLinkType | "">("");
  const [tempSaveAs, setTempSaveAs] = useState("");
  const [tempAuthor, setTempAuthor] = useState("");
  const [tempLicense, setTempLicense] = useState("All rights reserved");
  const pickerFileInputRef = useRef<HTMLInputElement>(null);
  const userHasEdited = useRef(false);
  const submitInFlight = useRef(false);

  const [editItem, setEditItem] = useState<StorageItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editPath, setEditPath] = useState("");
  const [editLinkType, setEditLinkType] = useState<SubmissionLinkType | "">("");

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("New folder");

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

  useEffect(() => {
    if (userHasEdited.current) return;
    if (submission?.links && submission.links.length > 0) {
      const urlLinks = submission.links.filter(
        (l) => l.storageProvider !== "AWS_S3"
      );
      if (urlLinks.length > 0) {
        setLinks(
          urlLinks.map((l) => ({
            clientId: l.id,
            linkType: l.linkType as SubmissionLinkType,
            url: l.url,
            label: l.label || "Resource Link",
          })),
        );
      } else {
        setLinks([createResourceLinkDraft()]);
      }
    } else {
      setLinks([createResourceLinkDraft()]);
    }
    if (submission?.note) setNote(submission.note);
  }, [submission]);

  const canEdit = requirementsQuery.data?.canEdit ?? false;
  const canSubmit = requirementsQuery.data?.canSubmit ?? false;
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
  const canUploadLocalFile = canEdit && localFileAvailability?.available === true;
  const uploadAccept = uploadPolicy
    ? [...uploadPolicy.acceptedMimeTypes, ...uploadPolicy.acceptedExtensions].join(",")
    : undefined;
  const persistedFileCount = (submission?.links ?? []).filter(
    (link) => Boolean(link.objectKey) || link.fileSizeBytes != null,
  ).length;
  const pendingFileCount = items.filter(
    (item) => item.type === "file" && item.file,
  ).length;

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
    const untypedFile = items.find(
      (item) => item.type === "file" && item.file && !item.linkType,
    );
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
        type: "file",
        name: f.name,
        file: f,
        size: f.size,
        lastModified: f.lastModified,
        author: teamInfo?.name || "Participant",
        license: "All rights reserved",
        path: currentPath,
      }));
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const openPicker = () => {
    if (!canEdit) return;
    if (!localFileAvailability?.available) {
      setErrorMsg(localFileAvailability?.message || "Local file upload is unavailable.");
      return;
    }
    setTempAuthor(teamInfo?.name || "Participant");
    setTempSaveAs("");
    setTempFile(null);
    setTempLinkType("");
    setTempLicense("All rights reserved");
    setPickerTab("local");
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
        type: "file",
        name: finalName,
        file: fileToSave,
        size: fileToSave.size,
        lastModified: fileToSave.lastModified,
        author: tempAuthor,
        license: tempLicense,
        path: currentPath,
        linkType: tempLinkType,
      };

      setItems((prev) => [...prev, newItem]);
      setIsPickerOpen(false);
    }
  };

  const openFolderModal = () => {
    if (!canEdit) return;
    setNewFolderName("New folder");
    setIsFolderModalOpen(true);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: StorageItem = {
        id: generateId(),
        type: "folder",
        name: newFolderName.trim(),
        size: 0,
        lastModified: Date.now(),
        author: teamInfo?.name || "Participant",
        license: "All rights reserved",
        path: currentPath,
      };
      setItems((prev) => [...prev, newFolder]);
      setIsFolderModalOpen(false);
      setNewFolderName("New folder");
    }
  };

  const openEditModal = (item: StorageItem) => {
    if (!canEdit) return;
    setEditItem(item);
    setEditName(item.name);
    setEditAuthor(item.author);
    setEditLicense(item.license);
    setEditPath(item.path);
    setEditLinkType(item.linkType ?? "");
  };

  const saveEdit = () => {
    if (editItem) {
      if (editItem.type === "file" && !editLinkType) {
        setErrorMsg("Select a submission type for this file.");
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                name: editName,
                author: editAuthor,
                license: editLicense,
                path: editPath,
                linkType: editItem.type === "file" ? editLinkType || undefined : undefined,
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
      setItems((prev) =>
        prev.filter(
          (i) =>
            i.id !== deleteTarget.id &&
            !i.path.startsWith(
              editItem?.path === "/"
                ? `/${editItem?.name}`
                : `${editItem?.path}/${editItem?.name}`,
            ),
        ),
      );
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

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(
      currentPath === "/" ? `/${folderName}` : `${currentPath}/${folderName}`,
    );
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
        item.type === "file" && Boolean(item.file && item.linkType),
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

    const actualFiles = items.filter((i) => i.type === "file");
    const validLinks = links.filter((l) => l.url.trim() !== "");
    const existingUploadedFiles = (submission?.links ?? []).filter(
      (l) => l.storageProvider === "AWS_S3"
    );
    if (validLinks.length === 0 && actualFiles.length === 0 && existingUploadedFiles.length === 0) {
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

  const currentItems = useMemo(
    () => items.filter((i) => i.path === currentPath),
    [items, currentPath],
  );
  const folders = useMemo(
    () => items.filter((i) => i.type === "folder"),
    [items],
  );

  const availableFolders = useMemo(
    () =>
      folders.filter((f) => {
        if (f.id === editItem?.id) return false;
        const editItemPath =
          editItem?.path === "/"
            ? `/${editItem?.name}`
            : `${editItem?.path}/${editItem?.name}`;
        if (f.path.startsWith(editItemPath)) return false;
        return true;
      }),
    [folders, editItem],
  );

  const historyEntries: SubmissionHistoryEntry[] = useMemo(
    () =>
      submission
        ? [
            {
              id: submission.id,
              submissionNumber: submission.submissionNumber,
              status: submission.status,
              submittedAt: submission.submittedAt ?? null,
              linkCount: submission.links?.length ?? 0,
              note: submission.note ?? undefined,
            },
          ]
        : [],
    [submission],
  );

  const renderTree = (path: string, depth: number = 0) => {
    const children = items.filter((i) => i.path === path);
    if (children.length === 0) return null;

    return (
      <ul className={`${depth > 0 ? "pl-6 relative mt-1.5" : "space-y-2"}`}>
        {depth > 0 && (
          <div className="absolute left-2.25 top-0 bottom-4 w-px border-l border-dotted border-slate-300 dark:border-slate-600"></div>
        )}
        {children.map((item) => {
          const itemPath =
            path === "/" ? `/${item.name}` : `${path}/${item.name}`;
          return (
            <li key={item.id} className="relative group flex flex-col">
              {depth > 0 && (
                <div className="absolute -left-2.75 top-3 w-3 border-t border-dotted border-slate-300 dark:border-slate-600"></div>
              )}
              <div className="flex items-center gap-2.5 py-1">
                {item.type === "folder" ? (
                  <svg
                    className="w-4.5 h-4.5 text-slate-800 dark:text-slate-200 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4.5 h-4.5 text-slate-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 3v18h10V8l-5-5H7z" />
                    <path d="M12 3v5h5" />
                  </svg>
                )}
                <span
                  onClick={() =>
                    item.type === "folder"
                      ? navigateToFolder(item.name)
                      : openEditModal(item)
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-[13px] truncate"
                >
                  {item.name}
                </span>
                {item.type === "file" && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {submissionTypeLabel(item.linkType)}
                  </span>
                )}
              </div>
              {item.type === "folder" && renderTree(itemPath, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        Loading...
      </div>
    );

  return (
    <div className="flex-1 min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
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
            {submission && <SubmissionStatusBadge status={submission.status} />}
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
          <SubmissionHistoryTable history={historyEntries} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm p-6 space-y-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    File submissions
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {uploadPolicy
                      ? `Max size: ${formatSize(uploadPolicy.maximumFileSizeBytes)}, max files: ${uploadPolicy.maximumFiles}`
                      : "Loading upload limits..."}
                  </div>
                </div>

                {submission?.links && submission.links.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30">
                    <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                      Saved evidence
                    </h2>
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
                    className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                  >
                    Uploading {uploadProgress.current} of {uploadProgress.total}: {uploadProgress.fileName}
                  </div>
                )}

                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] flex flex-col min-h-85 overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-2 flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <button
                        onClick={openPicker}
                        disabled={!canUploadLocalFile}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        title={localFileAvailability?.message || "Add file"}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      </button>
                      <button
                        onClick={openFolderModal}
                        disabled={!canEdit}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        title="Create folder"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                          <path
                            d="M19 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2z"
                            fill="currentColor"
                            opacity={0.5}
                          />
                        </svg>
                      </button>
                      <button
                        disabled
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 opacity-50"
                        title="Download all"
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>
                        </svg>
                      </button>
                      {selectedIds.size > 0 && canEdit && (
                        <button
                          onClick={() => confirmDelete("selected")}
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/50 transition-colors ml-1"
                          title="Delete"
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setViewMode("icon")}
                        className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors ${viewMode === "icon" ? "bg-slate-200 border-slate-300 dark:bg-slate-600 dark:border-slate-500 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors ${viewMode === "list" ? "bg-slate-200 border-slate-300 dark:bg-slate-600 dark:border-slate-500 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode("tree")}
                        className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors ${viewMode === "tree" ? "bg-slate-200 border-slate-300 dark:bg-slate-600 dark:border-slate-500 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 3h6v6H3zm2 2v2h2V5zM15 3h6v6h-6zm2 2v2h2V5zM9 15h6v6H9zm2 2v2h2v-2zM5 11v8h2v-8zM11 5h2v2h-2zM11 17h-2v-2h2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {viewMode !== "tree" && (
                    <div className="bg-white dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-2 flex items-center flex-wrap gap-2 text-sm">
                      <div
                        className="flex items-center gap-1.5 cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setCurrentPath("/")}
                      >
                        <svg
                          className="w-5 h-5 text-slate-800 dark:text-slate-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                        </svg>
                        <span className="font-semibold">Files</span>
                      </div>
                      {currentPath
                        .split("/")
                        .filter(Boolean)
                        .map((part, idx, arr) => {
                          const path = "/" + arr.slice(0, idx + 1).join("/");
                          return (
                            <div
                              key={path}
                              className="flex items-center gap-1.5 cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={() => setCurrentPath(path)}
                            >
                              <span className="text-slate-400">/</span>
                              <span className="font-semibold">{part}</span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  <div
                    className={`flex-1 relative ${dragActive ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"} overflow-auto cursor-pointer p-4`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (canEdit && currentItems.length === 0) openPicker();
                    }}
                  >
                    {currentItems.length === 0 && viewMode !== "tree" ? (
                      <div className="absolute inset-4 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 rounded-xl bg-white/50 dark:bg-slate-800/20 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <div className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800">
                          <svg
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11 5v11.17l-4.88-4.88c-.39-.39-1.03-.39-1.42 0-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41-.39-.39-1.03-.39-1.42 0L13 16.17V5c0-.55-.45-1-1-1s-1 .45-1 1z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold">
                          You can drag and drop files here to add them.
                        </p>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {viewMode === "icon" && (
                          <div className="flex flex-wrap gap-6">
                            {currentItems.map((item) => (
                              <div
                                key={item.id}
                                className="w-24 flex flex-col items-center group relative"
                              >
                                {item.type === "folder" ? (
                                  <div
                                    className="relative w-16 h-16 flex items-center justify-center cursor-pointer mb-2"
                                    onClick={() => navigateToFolder(item.name)}
                                  >
                                    <svg
                                      className="w-16 h-16 text-slate-800 dark:text-slate-300"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                    </svg>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(item);
                                      }}
                                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="12" cy="19" r="2" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => openEditModal(item)}
                                    className="relative w-18 h-20 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 transition-transform hover:scale-105 cursor-pointer mb-2 shadow-sm"
                                  >
                                    <div className="absolute top-0 right-0 w-4.5 h-4.5 border-l border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-bl-md"></div>
                                    <span className="text-[13px] font-black text-slate-700 dark:text-slate-300 mt-2">
                                      {getExt(item.name)}
                                    </span>
                                  </div>
                                )}
                                <span
                                  className="text-xs font-semibold w-full text-center truncate text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                  onClick={() =>
                                    item.type === "folder"
                                      ? navigateToFolder(item.name)
                                      : openEditModal(item)
                                  }
                                >
                                  {item.name}
                                </span>
                                {item.type === "file" && (
                                  <span className="mt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                    {submissionTypeLabel(item.linkType)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {viewMode === "list" && (
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-transparent">
                                <th className="p-3 w-12 text-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedIds.size ===
                                        currentItems.length &&
                                      currentItems.length > 0
                                    }
                                    onChange={() =>
                                      toggleSelectAll(
                                        currentItems.map((i) => i.id),
                                      )
                                    }
                                    className="cursor-pointer rounded border-slate-300 dark:border-slate-600 bg-transparent text-blue-600 focus:ring-blue-500"
                                  />
                                </th>
                                <th className="p-3 font-semibold">Name</th>
                                <th className="p-3 font-semibold">
                                  Last modified
                                </th>
                                <th className="p-3 font-semibold">Size</th>
                                <th className="p-3 font-semibold">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentItems.map((item) => (
                                <tr
                                  key={item.id}
                                  className={`border-b border-slate-100 dark:border-slate-700/50 transition-colors ${selectedIds.has(item.id) ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                                >
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.has(item.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleSelect(item.id);
                                      }}
                                      className="cursor-pointer rounded border-slate-300 dark:border-slate-600 bg-transparent text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td
                                    className="p-3 flex items-center gap-3"
                                    onClick={() =>
                                      item.type === "folder"
                                        ? navigateToFolder(item.name)
                                        : openEditModal(item)
                                    }
                                  >
                                    {item.type === "folder" ? (
                                      <svg
                                        className="w-5 h-5 text-slate-800 dark:text-slate-300"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-5 h-5 text-slate-400"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M7 3v18h10V8l-5-5H7z" />
                                        <path d="M12 3v5h5" />
                                      </svg>
                                    )}
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer truncate max-w-50">
                                      {item.name}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">
                                    {formatDate(item.lastModified)}
                                  </td>
                                  <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">
                                    {formatSize(item.size)}
                                  </td>
                                  <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">
                                    {item.type === "folder"
                                      ? "Folder"
                                      : submissionTypeLabel(item.linkType)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        {viewMode === "tree" && (
                          <div className="p-4">{renderTree("/")}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Resource Links
                  </div>
                </div>
                {links.map((link, idx) => (
                  <div
                    key={link.clientId}
                    className="flex flex-col sm:flex-row gap-3 items-start"
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

                {canEdit && (
                  <div className="flex gap-3 mt-1">
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
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Note to Reviewers
                </div>
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
              </div>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-800 dark:text-emerald-400 font-bold">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-800 dark:text-rose-400 font-bold">
                {errorMsg}
              </div>
            )}

            {canEdit && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
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
                  {submitting ? "Submitting..." : "Submit Final"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsPickerOpen(false)}
          />
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 bg-transparent">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Add Attachment
                </h2>
                <button
                  onClick={() => setIsPickerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
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
              <div className="flex px-6 gap-6">
                <button
                  onClick={() => setPickerTab("local")}
                  className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${pickerTab === "local" ? "text-blue-600 dark:text-blue-400 border-blue-600" : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Upload a file
                </button>
                <button
                  onClick={() => setPickerTab("drive")}
                  className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${pickerTab === "drive" ? "text-blue-600 dark:text-blue-400 border-blue-600" : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Google Drive
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {pickerTab === "local" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                      File Attachment
                    </label>
                    <div className="flex items-center gap-3 w-full mt-1">
                      <Button
                        variant="outlined"
                        onClick={() => pickerFileInputRef.current?.click()}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "10px",
                          borderColor: "#e2e8f0",
                          color: "#0f172a",
                          height: 40,
                          ".dark &": {
                            borderColor: "#334155",
                            color: "#f8fafc",
                          },
                        }}
                      >
                        Choose File
                      </Button>
                      <span className="text-[13px] text-slate-500 dark:text-slate-400 truncate">
                        {tempFile ? tempFile.name : "No file chosen"}
                      </span>
                    </div>
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

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                      Author
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      sx={filterTextFieldSx}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                      Choose licence
                    </label>
                    <select
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      value={tempLicense}
                      onChange={(e) => setTempLicense(e.target.value)}
                    >
                      <option value="All rights reserved">
                        All rights reserved
                      </option>
                      <option value="Public domain">Public domain</option>
                      <option value="Creative Commons">Creative Commons</option>
                    </select>
                  </div>

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

              {pickerTab === "drive" && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6.812 21L1.5 12l4.5-7.794h11.988L22.5 12 17.188 21H6.812zm1.04-1.5h8.296l4.148-7.5-4.148-7.5H7.852L3.704 12l4.148 7.5zM8.5 17l-3-5.5 3-5.5h7l3 5.5-3 5.5h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Google Drive
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Google Drive integration is currently pending API approval.
                    Please upload local files.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isFolderModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsFolderModalOpen(false)}
          />
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Create Folder
              </h2>
              <button
                onClick={() => setIsFolderModalOpen(false)}
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
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                Folder name
              </label>
              <TextField
                fullWidth
                size="small"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
                sx={filterTextFieldSx}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => setIsFolderModalOpen(false)}
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
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "10px",
                  boxShadow: "none",
                  height: 40,
                }}
              >
                Create
              </Button>
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
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                {editItem.type === "folder" ? (
                  <>
                    <button
                      onClick={() => confirmDelete(editItem.id)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors">
                      Zip
                    </button>
                  </>
                ) : (
                  <>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors">
                      Download
                    </button>
                    <button
                      onClick={() => confirmDelete(editItem.id)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
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

              {editItem.type === "file" && (
                <>
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
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Author
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      sx={filterTextFieldSx}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      Choose licence
                      <svg
                        className="w-4 h-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                    </label>
                    <select
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      value={editLicense}
                      onChange={(e) => setEditLicense(e.target.value)}
                    >
                      <option value="All rights reserved">
                        All rights reserved
                      </option>
                      <option value="Public domain">Public domain</option>
                      <option value="Creative Commons">Creative Commons</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Path
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={editPath}
                  onChange={(e) => setEditPath(e.target.value)}
                >
                  <option value="/">/</option>
                  {availableFolders.map((f) => (
                    <option key={f.id} value={`/${f.name}`}>
                      /{f.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  disabled={editItem.type === "file" && !editLinkType}
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
                  {editItem.type === "folder" ? (
                    <svg
                      className="w-10 h-10 text-slate-800 dark:text-slate-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                  ) : (
                    <>
                      <div className="absolute top-0 right-0 w-4.5 h-4.5 border-l border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-bl-md"></div>
                      <span className="text-[14px] font-black text-slate-800 dark:text-slate-300 mt-2">
                        {getExt(editItem.name)}
                      </span>
                    </>
                  )}
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
                      Created
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {formatDate(editItem.lastModified)}
                    </span>
                  </div>
                  {editItem.type === "file" && (
                    <div className="flex gap-4">
                      <span className="w-24 text-slate-500 dark:text-slate-400 font-medium">
                        Size
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {formatSize(editItem.size)}
                      </span>
                    </div>
                  )}
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
