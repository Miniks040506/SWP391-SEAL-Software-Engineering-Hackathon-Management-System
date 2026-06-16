import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roundApi } from "@/api/round.api";
import { submissionApi } from "@/api/submission.api";
import { teamApi } from "@/api/team.api";
import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type { RoundDetailResponse } from "@/types/round.types";
import type {
  RequiredLinkConfig,
  SaveSubmissionDraftRequest,
  SubmissionDetailResponse,
  SubmissionResponse,
  SubmissionSummaryResponse,
  SubmitDeliverablesRequest,
  UpdateSubmissionRequest,
} from "@/types/submission.types";
import type { TeamSummaryResponse } from "@/types/team.types";

export const participantSubmissionKeys = {
  teamSubmissions: (teamId?: UUID) => ["participant-team-submissions", teamId] as const,
  submissionDetail: (submissionId?: UUID) => ["participant-submission-detail", submissionId] as const,
  roundDetail: (roundId?: UUID) => ["participant-round-detail", roundId] as const,
};

export const useParticipantSubmissionData = (teamId?: UUID, roundId?: UUID) => {
  const [submission, setSubmission] = useState<SubmissionDetailResponse | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamSummaryResponse | null>(null);
  const [round, setRound] = useState<RoundDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!teamId || !roundId) return;
    setLoading(true);
    try {
      const [teams, summaries, roundDetail] = await Promise.all([
        teamApi.getMyTeams(),
        submissionApi.getTeamSubmissions(teamId),
        roundApi.getRoundById(roundId),
      ]);

      setRound(roundDetail);

      const currentTeam = teams.find((t) => t.id === teamId);
      if (currentTeam) setTeamInfo(currentTeam);

      const roundSub = summaries.find((s) => s.roundId === roundId);
      if (roundSub) {
        const detail = await submissionApi.getSubmissionById(roundSub.id);
        setSubmission(detail);
      } else {
        setSubmission(null);
      }
    } catch (err) {
      console.error("Failed to fetch submission data", err);
    } finally {
      setLoading(false);
    }
  }, [teamId, roundId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { submission, teamInfo, round, loading, refetch: fetch };
};

function invalidateParticipantSubmission(
  queryClient: ReturnType<typeof useQueryClient>,
  result: SubmissionResponse | SubmissionDetailResponse | null | undefined,
  teamId?: UUID,
  roundId?: UUID,
) {
  queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.teamSubmissions(teamId) });
  queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.roundDetail(roundId) });
  if (result?.id) {
    queryClient.invalidateQueries({ queryKey: participantSubmissionKeys.submissionDetail(result.id) });
  }
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

export const useRequiredLinkConfigQuery = (roundId?: UUID) => {
  const [configs, setConfigs] = useState<RequiredLinkConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roundId) return;
    const fetchConfigs = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get<RequiredLinkConfig[]>(
          `/rounds/${roundId}/required-links`,
        );
        setConfigs(res);
      } catch {
        console.error("Failed to fetch required link config");
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, [roundId]);

  return { configs, loading };
};

export const useTeamSubmissionsQuery = (teamId?: UUID) => {
  const [submissions, setSubmissions] = useState<SubmissionSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await submissionApi.getTeamSubmissions(teamId);
        setSubmissions(res);
      } catch (err) {
        console.error("Failed to fetch team submissions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [teamId]);

  return { submissions, loading };
};
