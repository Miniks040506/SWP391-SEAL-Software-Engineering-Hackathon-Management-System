import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import Alert from "@mui/material/Alert";

import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import { UserInviteSearchPanel } from "./components/UserInviteSearchPanel";
import { MentorJudgeAssignmentTable } from "./components/MentorJudgeAssignmentTable";
import { CreateGuestJudgeModal } from "./components/CreateGuestJugdeModal";
import { StepShell } from "./components/StepShell";

import {
  createJudgeTrackRoundAssignment,
  createMentorJudgeAssignment,
  type CreateEventFormValues,
  type RoundFormValues,
  type TrackFormValues,
} from "../../schemas/createEvent.schema";

import type { GuestJudgeResponse, AssignableUserResponse } from "@/types/user.types";

type MentorsJudgesStepProps = {
  tracks: TrackFormValues[];
  rounds: RoundFormValues[];
  onBack: () => void;
  onNext: () => void;
};

export function MentorsJudgesStep({
  tracks,
  rounds,
  onBack,
  onNext,
}: MentorsJudgesStepProps) {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const [activeTab, setActiveTab] = useState<"MENTOR" | "JUDGE">("MENTOR");
  const [isGuestJudgeModalOpen, setGuestJudgeModalOpen] = useState(false);
  const [createdGuestJudges, setCreatedGuestJudges] = useState<
    AssignableUserResponse[]
  >([]);

  const watchedAssignments =
    useWatch({ control, name: "mentorJudgeAssignments" }) ?? [];

  const { fields, remove, append } = useFieldArray({
    control,
    name: "mentorJudgeAssignments",
    keyName: "fieldId",
  });

  const assignments = fields.map((field, index) => ({
    ...field,
    ...(watchedAssignments[index] ?? {}),
  }));

  const mentorCount = assignments.filter((a) => a.role === "MENTOR").length;
  const judgeCount = assignments.filter((a) => a.role === "JUDGE").length;

  // 1. Xử lý khi chọn User CÓ SẴN (Dùng type AssignableUserResponse)
  const handleSelectExistingUser = (user: AssignableUserResponse) => {
    const isAlreadyAssigned = assignments.some(
      (a) =>
        a.role === activeTab &&
        (a.userId === user.userId ||
          (activeTab === "JUDGE" && Boolean(user.judgeId) && a.judgeId === user.judgeId)),
    );

    if (isAlreadyAssigned) return;

    const newAssignment = createMentorJudgeAssignment({
      userId: user.userId,
      judgeId: user.judgeId,
      email: user.email,
      fullName: user.fullName,
      role: activeTab,
    });

    append(
      activeTab === "JUDGE"
        ? {
            ...newAssignment,
            judgeRoundAssignments:
              tracks[0]?.id && rounds[0]?.id
                ? [createJudgeTrackRoundAssignment(tracks[0].id, rounds[0].id)]
                : [],
          }
        : newAssignment,
    );
    void trigger("mentorJudgeAssignments");
  };

  const handleGuestJudgeCreated = (judge: GuestJudgeResponse, fullName: string) => {
    setGuestJudgeModalOpen(false);
    setActiveTab("JUDGE");

    const guestUser: AssignableUserResponse = {
      userId: judge.userId,
      judgeId: judge.judgeId,
      email: judge.email,
      fullName,
      role: "JUDGE",
      status: "ACTIVE",
      judgeType: judge.judgeType,
      guest: judge.guest,
      temporary: judge.temporary,
      expiresAt: judge.expiresAt,
    };

    const newAssignment = createMentorJudgeAssignment({
      userId: judge.userId,
      judgeId: judge.judgeId,
      email: judge.email,
      fullName: fullName,
      role: "JUDGE",
    });

    const alreadyAssigned = assignments.some(
      (assignment) =>
        assignment.role === "JUDGE" &&
        (assignment.userId === judge.userId ||
          (Boolean(judge.judgeId) && assignment.judgeId === judge.judgeId)),
    );

    if (!alreadyAssigned) {
      append({
        ...newAssignment,
        judgeRoundAssignments:
          tracks[0]?.id && rounds[0]?.id
            ? [createJudgeTrackRoundAssignment(tracks[0].id, rounds[0].id)]
            : [],
      });
    }

    setCreatedGuestJudges((current) => [
      guestUser,
      ...current.filter((user) => user.userId !== guestUser.userId),
    ]);
    void trigger("mentorJudgeAssignments");
    setActiveTab("JUDGE"); // Tự động switch sang tab Judge
  };

  const handleRemoveAssignment = (index: number) => {
    remove(index);
    void trigger("mentorJudgeAssignments");
  };

  const arrayError = errors.mentorJudgeAssignments?.root?.message || errors.mentorJudgeAssignments?.message;

  return (
    <>
      <StepShell
        step={5}
        title="Mentors & Judges"
        description="Mentors are assigned to tracks. Judges are assigned to specific rounds inside specific tracks."
        headerActions={
          <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60">
            {(
              [
                {
                  key: "MENTOR" as const,
                  label: "Mentors",
                  count: mentorCount,
                  icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} />,
                },
                {
                  key: "JUDGE" as const,
                  label: "Judges",
                  count: judgeCount,
                  icon: <GavelOutlinedIcon sx={{ fontSize: 16 }} />,
                },
              ]
            ).map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                    active
                      ? "bg-white text-cyan-600 shadow-sm dark:bg-slate-900 dark:text-cyan-400"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                  ].join(" ")}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums",
                      active
                        ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300"
                        : "bg-slate-200/70 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        }
        bodyClassName="grid gap-6 px-7 py-6 xl:grid-cols-[380px_1fr]"
        onBack={onBack}
        next={{ label: "Next Step", onClick: onNext }}
      >
        <div className="flex flex-col gap-5">
          {typeof arrayError === "string" && (
            <Alert severity="error">{arrayError}</Alert>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-400 text-white shadow-md shadow-cyan-500/25">
                    {activeTab === "MENTOR" ? (
                      <SchoolOutlinedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <GavelOutlinedIcon sx={{ fontSize: 17 }} />
                    )}
                  </span>
                  <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                    Available {activeTab === "MENTOR" ? "Mentors" : "Judges"}
                  </h3>
                </div>

                {activeTab === "JUDGE" && (
                  <button
                    type="button"
                    onClick={() => setGuestJudgeModalOpen(true)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-300/70 bg-white px-3 py-1.5 text-xs font-black text-cyan-600 transition-colors duration-200 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 dark:border-cyan-500/30 dark:bg-slate-900 dark:text-cyan-400 dark:hover:bg-cyan-500/10"
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                    Guest Judge
                  </button>
                )}
              </div>

              <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Search by name or email, then invite to this event.
              </p>
            </div>

            <UserInviteSearchPanel
              role={activeTab}
              selectedUserIds={assignments
                .filter((assignment) => assignment.role === activeTab)
                .map((assignment) => assignment.userId)}
              extraUsers={activeTab === "JUDGE" ? createdGuestJudges : []}
              onSelect={handleSelectExistingUser}
            />
          </div>
        </div>

        <div className="min-w-0">
          <MentorJudgeAssignmentTable
            assignments={assignments}
            rowKeys={fields.map((field) => field.fieldId)}
            tracks={tracks}
            rounds={rounds}
            onRemove={handleRemoveAssignment}
          />
        </div>
      </StepShell>

      <CreateGuestJudgeModal
        open={isGuestJudgeModalOpen}
        onClose={() => setGuestJudgeModalOpen(false)}
        onSuccess={handleGuestJudgeCreated}
      />
    </>
  );
}
