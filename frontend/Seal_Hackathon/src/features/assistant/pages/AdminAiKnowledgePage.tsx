import { useState } from "react";
import { Chip, MenuItem, Skeleton, TextField } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import { textFieldSx } from "@/features/admin/schemas/admin.schema";
import {
  useCreateAiKnowledgeDocumentMutation,
  useReindexAiKnowledgeMutation,
  useSeedAiKnowledgeMutation,
} from "@/features/assistant/hooks/useAssistantAdminMutations";
import { useAiKnowledgeDocumentsQuery } from "@/features/assistant/hooks/useAssistantAdminQueries";
import type { CreateKnowledgeDocumentRequest } from "@/types/assistant.types";

const visibilityOptions = [
  "PUBLIC",
  "AUTHENTICATED",
  "STUDENT",
  "JUDGE",
  "MENTOR",
  "COORDINATOR",
  "ADMIN",
  "STAFF_ONLY",
] as const;

const initialForm: CreateKnowledgeDocumentRequest = {
  title: "",
  docType: "USER_GUIDE",
  sourceRef: "manual",
  visibility: "AUTHENTICATED",
  module: "GENERAL",
  useCaseId: "",
  roleScope: "ALL",
  content: "",
};

export function AdminAiKnowledgePage() {
  const { data, isLoading, isError } = useAiKnowledgeDocumentsQuery();
  const createMutation = useCreateAiKnowledgeDocumentMutation();
  const seedMutation = useSeedAiKnowledgeMutation();
  const reindexMutation = useReindexAiKnowledgeMutation();
  const [form, setForm] = useState(initialForm);

  const documents = data ?? [];
  const totalChunks = documents.reduce(
    (total, document) => total + document.chunkCount,
    0,
  );
  const activeDocuments = documents.filter(
    (document) => document.active,
  ).length;
  const canSubmit = Boolean(form.title.trim() && form.content.trim());
  const mutationFailed =
    createMutation.isError || seedMutation.isError || reindexMutation.isError;

  const submit = () => {
    if (!canSubmit) return;
    createMutation.mutate(form, {
      onSuccess: () => setForm(initialForm),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow="Administration Workspace"
        title="AI"
        accentTitle="Knowledge"
        description="Curate the approved guides, policies and technical references used by the SEAL assistant."
        icon={<PsychologyOutlinedIcon sx={{ fontSize: 34 }} />}
        actions={
          <>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AutoFixHighOutlinedIcon sx={{ fontSize: 18 }} />
              {seedMutation.isPending ? "Seeding" : "Seed defaults"}
            </button>
            <button
              type="button"
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <HubOutlinedIcon sx={{ fontSize: 18 }} />
              {reindexMutation.isPending ? "Reindexing" : "Reindex"}
            </button>
          </>
        }
      />

      <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
        {[
          ["Documents", documents.length],
          ["Active", activeDocuments],
          ["Indexed chunks", totalChunks],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`px-5 py-4 ${index ? "border-t border-slate-200 sm:border-t-0 sm:border-l dark:border-slate-800" : ""}`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950 tabular-nums dark:text-white">
              {isLoading ? "-" : value}
            </p>
          </div>
        ))}
      </section>

      {reindexMutation.data && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          Indexed {reindexMutation.data.indexedChunks} chunks with{" "}
          {reindexMutation.data.embeddingModel} at{" "}
          {reindexMutation.data.dimension} dimensions.
        </div>
      )}
      {mutationFailed && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          The AI knowledge operation could not be completed. Try again.
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">
            Add a knowledge document
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            Add only approved platform documentation. Visibility controls which
            roles can retrieve the content.
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TextField
              label="Title"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              size="small"
              className="md:col-span-2"
              sx={textFieldSx}
            />
            <TextField
              label="Document type"
              value={form.docType}
              onChange={(event) =>
                setForm({ ...form, docType: event.target.value })
              }
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Source reference"
              value={form.sourceRef}
              onChange={(event) =>
                setForm({ ...form, sourceRef: event.target.value })
              }
              size="small"
              sx={textFieldSx}
            />
            <TextField
              select
              label="Visibility"
              value={form.visibility}
              onChange={(event) =>
                setForm({
                  ...form,
                  visibility: event.target
                    .value as CreateKnowledgeDocumentRequest["visibility"],
                })
              }
              size="small"
              sx={textFieldSx}
            >
              {visibilityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Module"
              value={form.module}
              onChange={(event) =>
                setForm({ ...form, module: event.target.value })
              }
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Use case ID"
              value={form.useCaseId}
              onChange={(event) =>
                setForm({ ...form, useCaseId: event.target.value })
              }
              size="small"
              sx={textFieldSx}
            />
            <TextField
              label="Role scope"
              value={form.roleScope}
              onChange={(event) =>
                setForm({ ...form, roleScope: event.target.value })
              }
              size="small"
              sx={textFieldSx}
            />
          </div>
          <TextField
            label="Content"
            value={form.content}
            onChange={(event) =>
              setForm({ ...form, content: event.target.value })
            }
            multiline
            minRows={7}
            fullWidth
            placeholder="Paste an approved guide, policy, FAQ or technical note"
            sx={textFieldSx}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit || createMutation.isPending}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
            >
              <AddOutlinedIcon sx={{ fontSize: 18 }} />
              {createMutation.isPending ? "Adding" : "Add document"}
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Knowledge documents
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sources currently available to the retrieval pipeline.
            </p>
          </div>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 tabular-nums dark:bg-slate-800 dark:text-slate-300">
            {documents.length} items
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={62}
                className="rounded-2xl! dark:bg-slate-800"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="m-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            Could not load AI knowledge documents. Refresh the page to try
            again.
          </div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <DescriptionOutlinedIcon
              sx={{ fontSize: 34 }}
              className="text-slate-400"
            />
            <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
              No knowledge documents yet
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Seed the defaults or add an approved document above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60">
                <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Document</th>
                  <th className="px-5 py-4">Access</th>
                  <th className="px-5 py-4">Module</th>
                  <th className="px-5 py-4">Chunks</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="transition-colors hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                  >
                    <td className="min-w-[240px] px-5 py-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {document.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {document.sourceRef || "No source reference"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Chip size="small" label={document.visibility} />
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {document.module ?? "GENERAL"}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-700 tabular-nums dark:text-slate-200">
                      {document.chunkCount}
                    </td>
                    <td className="px-5 py-4">
                      <Chip
                        size="small"
                        color={document.active ? "success" : "default"}
                        label={document.active ? "Active" : "Inactive"}
                      />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(document.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
