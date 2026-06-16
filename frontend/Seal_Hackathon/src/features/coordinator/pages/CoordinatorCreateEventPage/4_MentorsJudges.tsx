import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { UserInviteSearchPanel } from "./components/UserInviteSearchPanel";
import { MentorJudgeAssignmentTable } from "./components/MentorJudgeAssignmentTable";
import { CreateGuestJudgeModal } from "./components/CreateGuestJugdeModal";

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

  const assignments = useWatch({ control, name: "mentorJudgeAssignments" }) ?? [];

  const { remove, append } = useFieldArray({
    control,
    name: "mentorJudgeAssignments",
    keyName: "fieldId",
  });

  const handleTabChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTab: "MENTOR" | "JUDGE" | null
  ) => {
    if (newTab !== null) {
      setActiveTab(newTab);
    }
  };

  // 1. Xử lý khi chọn User CÓ SẴN (Dùng type AssignableUserResponse)
  const handleSelectExistingUser = (user: AssignableUserResponse) => {
    const isAlreadyAssigned = assignments.some(
      (a) => a.userId === user.userId && a.role === activeTab
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

    const newAssignment = createMentorJudgeAssignment({
      userId: judge.userId, 
      judgeId: judge.judgeId, 
      email: judge.email,
      fullName: fullName, 
      role: "JUDGE",
    });

    append(newAssignment);
    setActiveTab("JUDGE"); // Tự động switch sang tab Judge
  };

  const arrayError = errors.mentorJudgeAssignments?.root?.message || errors.mentorJudgeAssignments?.message;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-7 py-5 sm:flex-row sm:items-center dark:border-slate-700">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Step 5: Mentors & Judges
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
            Mentors are assigned to tracks. Judges are assigned to specific rounds inside specific tracks.
          </p>
        </div>

        <ToggleButtonGroup
          color="primary"
          value={activeTab}
          exclusive
          onChange={handleTabChange}
          size="small"
          sx={{
            bgcolor: "#f8fafc",
            p: 0.5,
            borderRadius: "12px",
            ".MuiToggleButton-root": {
              textTransform: "none",
              fontWeight: 800,
              border: "none",
              borderRadius: "8px !important",
              px: 3,
            },
            ".Mui-selected": {
              bgcolor: "white !important",
              color: "#2563eb !important",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
            ".dark &": {
              bgcolor: "#0f172a",
              ".Mui-selected": { bgcolor: "#1e293b !important", color: "#38bdf8 !important" },
            }
          }}
        >
          <ToggleButton value="MENTOR">Mentors</ToggleButton>
          <ToggleButton value="JUDGE">Judges</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="grid gap-6 px-7 py-6 xl:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-5">
          {typeof arrayError === "string" && (
            <Alert severity="error">{arrayError}</Alert>
          )}

          <div className="rounded-2xl border border-gray-200 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Available {activeTab === "MENTOR" ? "Mentors" : "Judges"}
                </h3>
                
                {activeTab === "JUDGE" && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddOutlinedIcon fontSize="small" />}
                  onClick={() => setGuestJudgeModalOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: "8px", mt: 1 }}
                >
                  Guest Judge
                </Button>
              )}
              </div>
              
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Search by name or email, then invite to this event.
              </p>

              
            </div>

            <UserInviteSearchPanel 
              role={activeTab} 
              selectedUserIds={assignments
                .filter((assignment) => assignment.role === activeTab)
                .map((assignment) => assignment.userId)}
              onSelect={handleSelectExistingUser} 
            />
          </div>
        </div>

        <div className="min-w-0">
          <MentorJudgeAssignmentTable
            assignments={assignments}
            tracks={tracks}
            onRemove={remove}
          />
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5 dark:border-slate-700">
        <Button type="button" variant="outlined" onClick={onBack} sx={{ textTransform: "none", fontWeight: 700 }}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 900, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" } }}
        >
          Next Step
        </Button>
      </div>

      <CreateGuestJudgeModal 
        open={isGuestJudgeModalOpen} 
        onClose={() => setGuestJudgeModalOpen(false)}
        onSuccess={handleGuestJudgeCreated} 
      />
    </section>
  );
}
