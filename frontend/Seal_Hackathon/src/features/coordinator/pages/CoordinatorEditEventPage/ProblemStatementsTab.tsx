import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { roundApi } from "@/api/round.api";
import type { RoundResponse } from "@/types/round.types";
import { getCloudinaryDownloadUrl } from "@/utils/cloudinaryDownload";
import { TabShell } from "./TabShell";

type ProblemStatementsTabProps = {
  rounds: RoundResponse[];
  isLoading: boolean;
  canEdit: boolean;
  readonlyReason: string;
  onChanged: () => Promise<void>;
};

export function ProblemStatementsTab({
  rounds,
  isLoading,
  canEdit,
  readonlyReason,
  onChanged,
}: ProblemStatementsTabProps) {
  const [selectedRoundId, setSelectedRoundId] = useState<string>();

  const activeRoundId =
    selectedRoundId && rounds.some((round) => round.id === selectedRoundId)
      ? selectedRoundId
      : rounds[0]?.id;
  const selectedRound = rounds.find((round) => round.id === activeRoundId);
  const configuredCount = rounds.filter(
    (round) => round.problemStatementUrl,
  ).length;
  const uploadMutation = useMutation({
    mutationFn: ({ roundId, file }: { roundId: string; file: File }) =>
      roundApi.uploadProblemStatement(roundId, file),
    onSuccess: async () => {
      await onChanged();
      enqueueSnackbar("Problem statement uploaded.", { variant: "success" });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Failed to upload problem statement.",
        { variant: "error" },
      );
    },
  });

  const handleFile = (file?: File) => {
    if (!file || !activeRoundId) return;
    if (
      (!file.type || file.type.toLowerCase() !== "application/pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      enqueueSnackbar("Only PDF files are accepted.", { variant: "error" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      enqueueSnackbar("The PDF must not exceed 20MB.", { variant: "error" });
      return;
    }
    uploadMutation.mutate({ roundId: activeRoundId, file });
  };

  return (
    <TabShell
      tab="PROBLEMS"
      title="Exam paper setup"
      description="Configure and preview the PDF exam paper shown to teams in each round."
    >
      {!canEdit && (
        <Alert severity="info" sx={{ borderRadius: "14px" }}>
          {readonlyReason}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <CircularProgress />
        </div>
      ) : rounds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Create a round before adding its problem statement.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rounds
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {rounds.length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                Configured
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-200">
                {configuredCount}
              </p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                Delivery
              </p>
              <p className="mt-1 text-sm font-black text-violet-700 dark:text-violet-200">
                Cloudinary PDF
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <div className="space-y-2">
            {rounds.map((round) => (
              <button
                key={round.id}
                type="button"
                onClick={() => setSelectedRoundId(round.id)}
                aria-pressed={activeRoundId === round.id}
                className={[
                  "w-full cursor-pointer rounded-xl border px-4 py-3 text-left transition-colors",
                  activeRoundId === round.id
                    ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/60 dark:bg-violet-500/10 dark:text-violet-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                ].join(" ")}
              >
                <span className="block text-sm font-black">{round.name}</span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {round.isFinal ? "Final round" : `Round ${round.orderIndex}`}
                </span>
                <span
                  className={[
                    "mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                    round.problemStatementUrl
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  ].join(" ")}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {round.problemStatementUrl ? "Exam ready" : "PDF required"}
                </span>
              </button>
            ))}
            </div>

            {selectedRound && (
              <section
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
                aria-label={`${selectedRound.name} exam paper configuration`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                  <PictureAsPdfOutlinedIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                    Exam paper configuration
                  </p>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedRound.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {selectedRound.problemStatementFileName
                      ? `Current file: ${selectedRound.problemStatementFileName}`
                      : "No PDF has been uploaded for this round."}
                  </p>
                </div>
                  </div>

              {selectedRound.problemStatementUrl && (
                  <div className="flex flex-wrap gap-2">
                  <a
                    href={selectedRound.problemStatementUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:text-violet-300"
                  >
                    <OpenInNewOutlinedIcon sx={{ fontSize: 17 }} />
                    Open PDF
                  </a>
                  <a
                    href={getCloudinaryDownloadUrl(
                      selectedRound.problemStatementUrl,
                      selectedRound.problemStatementFileName ??
                        "exam-paper.pdf",
                    )}
                    download={selectedRound.problemStatementFileName ?? "problem-statement.pdf"}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-700"
                  >
                    <DownloadOutlinedIcon sx={{ fontSize: 17 }} />
                    Download
                  </a>
                </div>
              )}
                </div>

              <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
                <label
                    htmlFor={`problem-statement-file-${selectedRound.id}`}
                  className={[
                    "inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-colors",
                    canEdit && !uploadMutation.isPending
                      ? "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                  ].join(" ")}
                >
                  {uploadMutation.isPending ? (
                    <CircularProgress size={17} color="inherit" />
                  ) : (
                    <UploadFileOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                  {selectedRound.problemStatementUrl ? "Replace PDF" : "Upload PDF"}
                </label>
                <input
                    id={`problem-statement-file-${selectedRound.id}`}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  disabled={!canEdit || uploadMutation.isPending}
                  onChange={(event) => {
                    handleFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  PDF only · maximum 20MB · stored on Cloudinary
                </p>
              </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Team preview
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400">
                        This is the exam paper shown in Event Competing.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                      PDF
                    </span>
                  </div>
                  {selectedRound.problemStatementUrl ? (
                    <iframe
                      src={selectedRound.problemStatementUrl}
                      title={`${selectedRound.name} exam paper preview`}
                      className="h-[640px] w-full bg-slate-100 dark:bg-slate-950"
                    />
                  ) : (
                    <div className="grid min-h-72 place-items-center bg-slate-50 p-8 text-center dark:bg-slate-950/30">
                      <div>
                        <PictureAsPdfOutlinedIcon
                          sx={{ fontSize: 42 }}
                          className="text-slate-300 dark:text-slate-600"
                        />
                        <p className="mt-3 text-sm font-black text-slate-600 dark:text-slate-300">
                          Upload a PDF to preview the exam paper
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Teams will see it here when this round is selected.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </TabShell>
  );
}
