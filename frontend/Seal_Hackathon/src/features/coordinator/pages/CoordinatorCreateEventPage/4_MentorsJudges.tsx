import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import Button from "@mui/material/Button";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import type { UserSummaryResponse } from "@/types/user.types";

import {
  createMentorJudgeAssignment,
  type CreateEventFormValues,
  type MentorJudgeFormValues,
} from "../../schemas/createEvent.schema";

import { UserInviteSearchPanel } from "./components/UserInviteSearchPanel";
import { MentorJudgeAssignmentTable } from "./components/MentorJudgeAssignmentTable";

type MentorsJudgesStepProps = {
  onBack: () => void;
  onNext: () => void;
};

export const MentorsJudgesStep = ({
  onBack,
  onNext,
}: MentorsJudgesStepProps) => {
  const { control } = useFormContext<CreateEventFormValues>();

  const [activeRole, setActiveRole] =
    useState<MentorJudgeFormValues["role"]>("Mentor");

  const { append: appendAssignment, remove: removeAssignment } = useFieldArray({
    control,
    name: "mentorJudgeAssignments",
    keyName: "fieldId",
  });

  const tracks = useWatch({
    control,
    name: "tracks",
  });

  const assignments = useWatch({
    control,
    name: "mentorJudgeAssignments",
  });

  const currentTracks = tracks ?? [];
  const currentAssignments = assignments ?? [];

  const selectedUserIds = currentAssignments
    .filter((assignment) => assignment.role === activeRole)
    .map((assignment) => assignment.userId);

  const handleInviteUser = (user: UserSummaryResponse) => {
    appendAssignment(
      createMentorJudgeAssignment({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        role: activeRole,
      }),
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-7 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 4: Mentors & Judges
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search available users, invite mentors or judges, then assign them
            to one or more tracks.
          </p>
        </div>

        <div className="flex rounded-xl border border-gray-200 bg-slate-50 p-1">
          <Button
            type="button"
            startIcon={<GroupsOutlinedIcon />}
            onClick={() => setActiveRole("Mentor")}
            sx={{
              px: 2,
              borderRadius: 2,
              bgcolor: activeRole === "Mentor" ? "white" : "transparent",
              color: activeRole === "Mentor" ? "#2563eb" : "#64748b",
              boxShadow:
                activeRole === "Mentor"
                  ? "0 1px 3px rgba(15, 23, 42, 0.12)"
                  : "none",
            }}
          >
            Mentors
          </Button>

          <Button
            type="button"
            startIcon={<HowToRegOutlinedIcon />}
            onClick={() => setActiveRole("Judge")}
            sx={{
              px: 2,
              borderRadius: 2,
              bgcolor: activeRole === "Judge" ? "white" : "transparent",
              color: activeRole === "Judge" ? "#2563eb" : "#64748b",
              boxShadow:
                activeRole === "Judge"
                  ? "0 1px 3px rgba(15, 23, 42, 0.12)"
                  : "none",
            }}
          >
            Judges
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-7 py-6 xl:grid-cols-[380px_1fr]">
        <UserInviteSearchPanel
          role={activeRole}
          selectedUserIds={selectedUserIds}
          onInvite={handleInviteUser}
        />

        <MentorJudgeAssignmentTable
          assignments={currentAssignments}
          tracks={currentTracks}
          onRemove={removeAssignment}
        />
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          {currentAssignments.length === 0 ? "Skip Step" : "Next Step"}
        </Button>
      </div>
    </section>
  );
};
