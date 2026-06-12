import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import { submissionApi } from "@/api/submission.api";
import { useParticipantSubmissionData } from "../hooks/useParticipantSubmissionQueries";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import { SubmissionHistoryTable } from "../components/SubmissionHistoryTable";
import { filterTextFieldSx } from "../schemas/submissions.schema";
import type {
  CreateSubmissionLinkRequest,
  SubmissionLinkType,
  SubmissionHistoryEntry,
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
};

function detectLinkType(url: string): SubmissionLinkType {
  const lower = url.toLowerCase();

  if (lower.includes("github.com") || lower.includes("gitlab.com")) {
    return "REPOSITORY";
  }

  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) {
    return "VIDEO";
  }

  if (lower.includes("slides.google.com") || lower.endsWith(".ppt") || lower.endsWith(".pptx")) {
    return "SLIDE";
  }

  if (lower.includes("docs.google.com/document") || lower.endsWith(".pdf") || lower.includes("report")) {
    return "REPORT";
  }

  if (
    lower.includes("demo") ||
    lower.includes("vercel.app") ||
    lower.includes("netlify.app") ||
    lower.includes("render.com")
  ) {
    return "DEMO";
  }

  return "OTHER";
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

export function SubmissionFormPage() {
  const { teamId, roundId } = useParams<{ teamId: string; roundId: string }>();
  const navigate = useNavigate();

  const { submission, teamInfo, loading, refetch } =
    useParticipantSubmissionData(teamId, roundId);

  const [items, setItems] = useState<StorageItem[]>([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"icon" | "list" | "tree">("icon");

  const [linkUrl, setLinkUrl] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  const [dragActive, setDragActive] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"local" | "drive">("local");
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempSaveAs, setTempSaveAs] = useState("");
  const [tempAuthor, setTempAuthor] = useState("");
  const [tempLicense, setTempLicense] = useState("All rights reserved");
  const pickerFileInputRef = useRef<HTMLInputElement>(null);

  const [editItem, setEditItem] = useState<StorageItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editPath, setEditPath] = useState("");

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("New folder");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | "selected" | null>(
    null,
  );

  useEffect(() => {
    if (submission?.links && submission.links.length > 0) {
      setLinkUrl(submission.links[0].url);
    }
    if (submission?.note) setNote(submission.note);
  }, [submission]);

  const isLeader = teamInfo?.roleInTeam === "LEADER";
  const isApproved = teamInfo?.status === "APPROVED";
  const canEdit = isLeader && isApproved;

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
      const newItems: StorageItem[] = Array.from(e.dataTransfer.files).map(
        (f) => ({
          id: generateId(),
          type: "file",
          name: f.name,
          file: f,
          size: f.size,
          lastModified: f.lastModified,
          author: teamInfo?.name || "Participant",
          license: "All rights reserved",
          path: currentPath,
        }),
      );
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const openPicker = () => {
    if (!canEdit) return;
    setTempAuthor(teamInfo?.name || "Participant");
    setTempSaveAs("");
    setTempFile(null);
    setTempLicense("All rights reserved");
    setPickerTab("local");
    setIsPickerOpen(true);
  };

  const handleModalUpload = () => {
    if (tempFile) {
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
  };

  const saveEdit = () => {
    if (editItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                name: editName,
                author: editAuthor,
                license: editLicense,
                path: editPath,
              }
            : i,
        ),
      );
      setEditItem(null);
    }
  };

  const confirmDelete = (target: string | "selected") => {
    setDeleteTarget(target);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (deleteTarget === "selected") {
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } else if (deleteTarget) {
      setItems((prev) =>
        prev.filter(
          (i) =>
            i.id !== deleteTarget &&
            !i.path.startsWith(
              editItem?.path === "/"
                ? `/${editItem?.name}`
                : `${editItem?.path}/${editItem?.name}`,
            ),
        ),
      );
      setSelectedIds(
        new Set(
          [...selectedIds].filter((selectedId) => selectedId !== deleteTarget),
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

  const autoFetchGithubLink = () => {
    setLinkUrl(
      `https://github.com/organization/${teamInfo?.name?.replace(/\s+/g, "-") || "project"}`,
    );
  };

  const buildLinks = (): CreateSubmissionLinkRequest[] => {
    if (!linkUrl.trim()) return [];
    return [
      {
        linkType: detectLinkType(linkUrl),
        label: "Resource Link",
        url: linkUrl.trim(),
        isPrimary: true,
      },
    ];
  };

  const handleSaveDraft = async () => {
    if (!teamId || !roundId) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload = { links: buildLinks(), note: note.trim() || undefined };
      if (submission?.id) {
        await submissionApi.updateSubmission(submission.id, {
          note: note.trim() || undefined,
          links: payload.links,
        });
      } else {
        await submissionApi.saveSubmissionDraft(teamId, roundId, payload);
      }
      setSuccessMsg("Draft saved successfully.");
      refetch();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { message?: string })?.message || "Failed to save draft.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!teamId || !roundId) return;
    const actualFiles = items.filter((i) => i.type === "file");
    if (!linkUrl.trim() && actualFiles.length === 0) {
      setErrorMsg("Please provide at least a link or upload a file.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload = { links: buildLinks(), note: note.trim() || undefined };
      let submissionId = submission?.id;
      if (submissionId) {
        await submissionApi.updateSubmission(submissionId, {
          note: note.trim() || undefined,
          links: payload.links,
        });
        await submissionApi.submitExistingSubmission(submissionId);
      } else {
        const created = await submissionApi.submitDeliverables(
          teamId,
          roundId,
          payload,
        );
        submissionId = created.id;
      }
      setSuccessMsg("Submission confirmed! Reviewers have been notified.");
      refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorMsg(
        msg?.includes("deadline")
          ? "Deadline exceeded. Submission is blocked."
          : msg || "Failed to submit.",
      );
    } finally {
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

        {!isLeader && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Read-only mode:</strong> Only the Team Leader can submit or
            edit deliverables.
          </div>
        )}
        {isLeader && !isApproved && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
            <strong>Action blocked:</strong> Your team registration is not
            APPROVED. Submissions are disabled.
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
                    Max size: 10 MB, max files: 20
                  </div>
                </div>

                <div className="w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-[#f8fafc] dark:bg-[#1e293b] flex flex-col min-h-85 overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-2 flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <button
                        onClick={openPicker}
                        disabled={!canEdit}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        title="Add file"
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
                                      : `${getExt(item.name)} document`}
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
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Resource Link
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <TextField
                    fullWidth
                    size="small"
                    disabled={!canEdit}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://github.com/... or any external link"
                    sx={filterTextFieldSx}
                  />
                  <Button
                    variant="contained"
                    disabled={!canEdit}
                    onClick={autoFetchGithubLink}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      boxShadow: "none",
                      bgcolor: "#0f172a",
                      color: "#ffffff",
                      height: 40,
                      whiteSpace: "nowrap",
                      "&:hover": { bgcolor: "#1e293b" },
                      ".dark &": {
                        bgcolor: "#f8fafc",
                        color: "#0f172a",
                        "&:hover": { bgcolor: "#e2e8f0" },
                      },
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      style={{ marginRight: 6 }}
                    >
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    Fetch
                  </Button>
                </div>
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
                  onChange={(e) => setNote(e.target.value)}
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
                  disabled={submitting || saving}
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
                  {submitting ? "Saving..." : "Save Changes"}
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
                      className="hidden"
                      ref={pickerFileInputRef}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setTempFile(e.target.files[0]);
                          setTempSaveAs(e.target.files[0].name);
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
                      disabled={!tempFile}
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete{" "}
              {deleteTarget === "selected" ? "the selected items" : "this item"}
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => setIsDeleteModalOpen(false)}
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
                onClick={executeDelete}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "10px",
                  boxShadow: "none",
                  height: 40,
                  bgcolor: "#ef4444",
                  "&:hover": { bgcolor: "#dc2626" },
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
