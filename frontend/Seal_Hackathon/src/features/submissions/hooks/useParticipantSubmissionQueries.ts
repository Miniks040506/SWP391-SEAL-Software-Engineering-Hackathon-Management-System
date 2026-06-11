import { useState, useEffect, useCallback } from "react";
import { submissionApi } from "@/api/submission.api";
import { teamApi } from "@/api/team.api";
import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  RequiredLinkConfig,
  SubmissionDetailResponse,
  SubmissionSummaryResponse,
} from "@/types/submission.types";
import type { TeamSummaryResponse } from "@/types/team.types";

export const useParticipantSubmissionData = (teamId?: UUID, roundId?: UUID) => {
  const [submission, setSubmission] = useState<SubmissionDetailResponse | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!teamId || !roundId) return;
    setLoading(true);
    try {
      const [teams, summaries] = await Promise.all([
        teamApi.getMyTeams(),
        submissionApi.getTeamSubmissions(teamId),
      ]);

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

  return { submission, teamInfo, loading, refetch: fetch };
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