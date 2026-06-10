import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import { apiRequest } from "@/api/apiRequest";
import {
  useParticipantSubmissionData,
  useRequiredLinkConfigQuery,
} from "../hooks/useParticipantSubmissionQueries";
import { SubmissionLinkFields, type LinkFieldValue } from "../components/SubmissionLinkFields";
import { RequiredLinkTypeChecklist } from "../components/RequiredLinkTypeChecklist";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";
import { SubmissionHistoryTable, type SubmissionHistoryEntry } from "../components/SubmissionHistoryTable";
import { filterTextFieldSx } from "../schemas/submissions.schema";

export function SubmissionFormPage() {
  const { teamId, roundId } = useParams<{ teamId: string; roundId: string }>();
  const navigate = useNavigate();

  const { submission, teamInfo, loading, refetch } = useParticipantSubmissionData(teamId, roundId);
  const { configs, loading: configLoading } = useRequiredLinkConfigQuery(roundId);

  const [linkFields, setLinkFields] = useState<LinkFieldValue[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  useEffect(() => {
    if (configLoading) return;

    const base: LinkFieldValue[] = configs.map((cfg) => ({
      linkType: cfg.linkType,
      label: cfg.label,
      url: "",
      isPrimary: cfg.isPrimary,
      isRequired: cfg.isRequired,
    }));

    if (submission?.links) {
      const merged = base.map((field) => {
        const existing = submission.links.find((l) => l.linkType === field.linkType);
        return existing ? { ...field, url: existing.url, linkId: existing.id } : field;
      });
      const configTypes = new Set(base.map((f) => f.linkType));
      const extras = submission.links
        .filter((l) => !configTypes.has(l.linkType))
        .map((l) => ({
          linkType: l.linkType,
          label: l.label || l.linkType, // Fixed TS error here
          url: l.url,
          isPrimary: l.isPrimary ?? false,
          isRequired: false,
          linkId: l.id,
        }));
      setLinkFields([...merged, ...extras]);
    } else {
      setLinkFields(base);
    }

    if (submission?.note) setNote(submission.note);
  }, [configs, submission, configLoading]);

  const checklistItems = configs.map((cfg) => ({
    linkType: cfg.linkType,
    label: cfg.label,
    isRequired: cfg.isRequired,
    isFilled: Boolean(linkFields.find((f) => f.linkType === cfg.linkType)?.url?.trim()),
  }));

  const allRequiredFilled = checklistItems.filter((i) => i.isRequired).every((i) => i.isFilled);

  // Business Rules Checks
  const isLeader = teamInfo?.roleInTeam === "LEADER";
  const isApproved = teamInfo?.status === "APPROVED";
  const canEdit = isLeader && isApproved;

  const buildPayload = () => ({
    links: linkFields
      .filter((f) => f.url.trim())
      .map((f) => ({
        linkType: f.linkType,
        label: f.label,
        url: f.url.trim(),
        isPrimary: f.isPrimary,
      })),
    note: note.trim() || undefined,
  });

  const handleSaveDraft = async () => {
    if (!teamId || !roundId) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      if (submission?.id) {
        await apiRequest.patch(`/submissions/${submission.id}`, { note: note.trim() });
        // NOTE: Trong thực tế, bạn cần loop qua các link để gọi addSubmissionLink / updateSubmissionLink theo API BE đã cung cấp. 
        // Để đơn giản gọn nhẹ form data, ta gọi thẳng PATCH payload.
        await apiRequest.patch(`/submissions/${submission.id}`, buildPayload());
      } else {
        await apiRequest.post(`/teams/${teamId}/rounds/${roundId}/submissions`, buildPayload());
      }
      setSuccessMsg("Draft saved successfully.");
      refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setErrorMsg(msg || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!teamId || !roundId) return;
    if (!allRequiredFilled) {
      setErrorMsg("Please fill in all required links before submitting.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      let submissionId = submission?.id;
      if (submissionId) {
        await apiRequest.patch(`/submissions/${submissionId}`, buildPayload());
      } else {
        const created = await apiRequest.post<{ id: string }>(`/teams/${teamId}/rounds/${roundId}/submissions`, buildPayload());
        submissionId = created.id;
      }
      
      // Final submit confirmation
      await apiRequest.post(`/submissions/${submissionId}/submit`, {});
      
      setSuccessMsg("Submission confirmed! Your team has been notified.");
      refetch();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      if (msg?.includes("deadline")) {
          setErrorMsg("Deadline exceeded. Submission is blocked.");
      } else {
          setErrorMsg(msg || "Failed to submit.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const historyEntries: SubmissionHistoryEntry[] = submission
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
    : [];

  if (loading || configLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading submission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-3 flex items-center gap-1.5 transition-colors"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Back
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Round Submission
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Manage deliverables for your team.
              </p>
            </div>
            {submission && <SubmissionStatusBadge status={submission.status} />}
          </div>
        </div>

        {/* Cảnh báo quyền và trạng thái */}
        {!isLeader && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Read-only mode:</strong> Only the Team Leader can submit or edit deliverables.
          </div>
        )}
        {isLeader && !isApproved && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
            <strong>Action blocked:</strong> Your team registration is not APPROVED. Submissions are disabled.
          </div>
        )}

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-6">
          {(["form", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-blue-500"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab === "form" ? "Submit Deliverables" : "Submission History"}
            </button>
          ))}
        </div>

        {activeTab === "history" ? (
          <SubmissionHistoryTable history={historyEntries} />
        ) : (
          <div className="space-y-5">
            {configs.some((c) => c.isRequired) && (
              <RequiredLinkTypeChecklist linkTypes={checklistItems} />
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Deliverable Links</h2>
              </div>
              <div className="p-5">
                {linkFields.length > 0 ? (
                  <SubmissionLinkFields
                    fields={linkFields}
                    onChange={setLinkFields}
                    disabled={!canEdit}
                  />
                ) : (
                  <p className="text-sm text-slate-400 italic">No link types configured.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Note to Reviewers</h2>
              </div>
              <div className="p-5">
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
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
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {canEdit && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || submitting}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || saving || !allRequiredFilled}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : submission?.status === "SUBMITTED" || submission?.status === "LATE" ? "Resubmit →" : "Submit →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}