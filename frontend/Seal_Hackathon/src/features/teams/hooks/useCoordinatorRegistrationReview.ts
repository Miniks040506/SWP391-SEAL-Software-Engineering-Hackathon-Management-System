import { useState } from "react";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type { CoordinatorTeamDetailResponse } from "@/types/team.types";

export const useCoordinatorRegistrationReview = () => {
  const [reviewingTeamId, setReviewingTeamId] = useState<UUID | null>(null);
  const [error, setError] = useState<string | null>(null);

  const approve = async (teamId: UUID): Promise<CoordinatorTeamDetailResponse> => {
    setReviewingTeamId(teamId);
    setError(null);
    try {
      return await teamApi.approveTeamRegistration(teamId);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Failed to approve team registration.";
      setError(message);
      throw cause;
    } finally {
      setReviewingTeamId(null);
    }
  };

  const reject = async (
    teamId: UUID,
    reason: string,
  ): Promise<CoordinatorTeamDetailResponse> => {
    setReviewingTeamId(teamId);
    setError(null);
    try {
      return await teamApi.rejectTeamRegistration(teamId, {
        reason: reason.trim(),
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Failed to reject team registration.";
      setError(message);
      throw cause;
    } finally {
      setReviewingTeamId(null);
    }
  };

  return {
    approve,
    reject,
    reviewingTeamId,
    error,
    clearError: () => setError(null),
  };
};
