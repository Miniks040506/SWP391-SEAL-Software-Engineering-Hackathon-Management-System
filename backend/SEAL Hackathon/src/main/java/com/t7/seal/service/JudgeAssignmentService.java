package com.t7.seal.service;

import com.t7.seal.request.round.AssignJudgeRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.JudgeSubmissionAssignmentResponse;
import com.t7.seal.response.grading.JudgeSubmissionQueueSummaryResponse;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface JudgeAssignmentService {

    List<JudgeAssignmentResponse> getJudgeAssignments(UUID roundId);

    JudgeAssignmentResponse assignJudge(UUID roundId, AssignJudgeRequest request, Authentication authentication);

    void removeJudgeAssignment(UUID roundId, UUID assignmentId, Authentication authentication);

    void removeJudgeAssignmentById(UUID assignmentId, Authentication authentication);

    List<JudgeAssignmentResponse> getMyAssignments(Authentication authentication);

    PageResponse<JudgeSubmissionAssignmentResponse> getMySubmissionQueue(
            UUID roundId,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    );

    JudgeSubmissionQueueSummaryResponse getMySubmissionQueueSummary(
            UUID roundId,
            Authentication authentication
    );

    PageResponse<AssignedSubmissionResponse> getMyAssignedSubmissionsForGrading(
            UUID roundId,
            String status,
            int page,
            int size,
            Authentication authentication
    );

    GradingSubmissionDetailResponse getMySubmissionDetail(UUID submissionId, Authentication authentication);
}
