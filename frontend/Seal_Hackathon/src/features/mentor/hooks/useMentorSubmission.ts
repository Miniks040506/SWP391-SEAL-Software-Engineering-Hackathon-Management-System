import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { submissionApi } from "@/api/submission.api";
import type { UUID } from "@/types";

export function useMentorSubmission() {
    const { teamId, submissionId } = 
        useParams<{
            teamId: UUID;
            submissionId: UUID
        }> ();
    const navigate = useNavigate();

    const teamSubmissionQuery = useQuery({
        queryKey: ["memtor-team-submission", teamId],
        queryFn: () => submissionApi.getMentorTeamSubmissions(teamId as UUID),
        enabled: !!teamId,
        staleTime: 600_000,
    });

    const submissionDetailQuery = useQuery({
        queryKey: ["mentor-submission-detail", submissionId],
        queryFn: () => submissionApi.getMentorSubmissionById(submissionId as UUID),
        enabled: !!submissionId,
        staleTime: 60_000,
    });
    
    const goToSubmissionDetail = (id: UUID) => {
        if (teamId){
            navigate(`mentor/team/${teamId}/submission/${id}`);
        }
    };

    const goBackToHistory = () => {
        if (teamId) {
            navigate(`mentor/team/${teamId}/submissions`);
        }
    };

    return {
        teamId,
        submissionId,
        teamSubmissionQuery,
        submissionDetailQuery,
        goToSubmissionDetail,
        goBackToHistory,
    };
}