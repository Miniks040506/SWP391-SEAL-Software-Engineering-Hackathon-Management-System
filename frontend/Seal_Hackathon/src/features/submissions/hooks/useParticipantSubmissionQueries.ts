import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import { submissionApi } from "@/api/submission.api";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type {
  SaveSubmissionDraftRequest,
  SubmissionDetailResponse,
  SubmissionResponse,
  SubmitDeliverablesRequest,
  UpdateSubmissionRequest,
} from "@/types/submission.types";

export const participantSubmissionKeys = {
  context: (teamId?: UUID, roundId?: UUID) =>
    ["participant-submission-context", teamId, roundId] as const,
  teamSubmissions: (teamId?: UUID) => ["participant-team-submissions", teamId] as const,
  submissionDetail: (submissionId?: UUID) => ["participant-submission-detail", submissionId] as const,
  attempts: (submissionId?: UUID) => ["participant-submission-attempts", submissionId] as const,
  roundDetail: (roundId?: UUID) => ["participant-round-detail", roundId] as const,
  requirements: (teamId?: UUID, roundId?: UUID) =>
    ["participant-submission-requirements", teamId, roundId] as const,
};

export const useParticipantSubmissionData = (teamId?: UUID, roundId?: UUID) => {
  const query = useQuery({
    queryKey: participantSubmissionKeys.context(teamId, roundId),
    queryFn: async () => {
      const [teams, summaries, round] = await Promise.all([
        teamApi.getMyTeams(),
        submissionApi.getTeamSubmissions(teamId!),
        roundApi.getRoundById(roundId!),
      ]);
      const roundSub = summaries.find((s) => s.roundId === roundId);
      const submission = roundSub
        ? await submissionApi.getSubmissionById(roundSub.id)
        : null;

      return {
        submission,
        teamInfo: teams.find((team) => team.id === teamId) ?? null,
        round,
      };
    },
    enabled: Boolean(teamId && roundId),
  });

  return {
    submission: query.data?.submission ?? null,
    teamInfo: query.data?.teamInfo ?? null,
    round: query.data?.round ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

async function invalidateParticipantSubmission(
  queryClient: ReturnType<typeof useQueryClient>,
  result: SubmissionResponse | SubmissionDetailResponse | null | undefined,
  teamId?: UUID,
  roundId?: UUID,
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.context(teamId, roundId) }),
    queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.teamSubmissions(teamId) }),
    queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.roundDetail(roundId) }),
    queryClient.invalidateQueries({
      queryKey: participantSubmissionKeys.requirements(teamId, roundId),
    }),
    queryClient.invalidateQueries({ queryKey: ["mentor-team-submissions", teamId] }),
    queryClient.invalidateQueries({ queryKey: ["mentor-submission-detail"] }),
    queryClient.invalidateQueries({ queryKey: ["coord-dashboard-submissions"] }),
    queryClient.invalidateQueries({ queryKey: ["judge"] }),
    queryClient.invalidateQueries({ queryKey: ["judge-submission-summary"] }),
    queryClient.invalidateQueries({ queryKey: ["grading", "submission"] }),
    queryClient.invalidateQueries({ queryKey: ["round", roundId, "submissions"] }),
  ];
  if (result?.id) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: participantSubmissionKeys.submissionDetail(result.id),
      }),
      queryClient.invalidateQueries({
        queryKey: participantSubmissionKeys.attempts(result.id),
      }),
    );
  }
  await Promise.all(invalidations);
}

export const useSaveSubmissionDraftMutation = (teamId?: UUID, roundId?: UUID) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveSubmissionDraftRequest) =>
      submissionApi.saveSubmissionDraft(teamId!, roundId!, payload),
    onSuccess: (result) => invalidateParticipantSubmission(queryClient, result, teamId, roundId),
  });
};

export const useUpdateSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: UUID;
      payload: UpdateSubmissionRequest;
    }) => submissionApi.updateSubmission(submissionId, payload),
    onSuccess: (result) =>
      invalidateParticipantSubmission(queryClient, result, result.teamId, result.roundId),
  });
};

export const useSubmitDeliverablesMutation = (teamId?: UUID, roundId?: UUID) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitDeliverablesRequest) =>
      submissionApi.submitDeliverables(teamId!, roundId!, payload),
    onSuccess: (result) => invalidateParticipantSubmission(queryClient, result, teamId, roundId),
  });
};

export const useSubmitExistingSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: UUID) => submissionApi.submitExistingSubmission(submissionId),
    onSuccess: (result) =>
      invalidateParticipantSubmission(queryClient, result, result.teamId, result.roundId),
  });
};

export const useBeginSubmissionResubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: UUID) => submissionApi.beginSubmissionResubmission(submissionId),
    onSuccess: (result) =>
      invalidateParticipantSubmission(queryClient, result, result.teamId, result.roundId),
  });
};

export const useSubmissionRequirementsQuery = (teamId?: UUID, roundId?: UUID) => {
  return useQuery({
    queryKey: participantSubmissionKeys.requirements(teamId, roundId),
    queryFn: () => submissionApi.getSubmissionRequirements(teamId!, roundId!),
    enabled: Boolean(teamId && roundId),
    staleTime: 30_000,
  });
};

export const useSubmissionAttemptsQuery = (submissionId?: UUID) => {
  return useQuery({
    queryKey: participantSubmissionKeys.attempts(submissionId),
    queryFn: () => submissionApi.getSubmissionAttempts(submissionId!),
    enabled: Boolean(submissionId),
  });
};

export const useTeamSubmissionsQuery = (teamId?: UUID) => {
  const query = useQuery({
    queryKey: participantSubmissionKeys.teamSubmissions(teamId),
    queryFn: () => submissionApi.getTeamSubmissions(teamId!),
    enabled: Boolean(teamId),
  });

  return {
    submissions: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
