package com.t7.seal.service;

import com.t7.seal.request.round.AssignJudgeRequest;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface JudgeAssignmentService {

    List<JudgeAssignmentResponse> getJudgeAssignments(UUID roundId);

    JudgeAssignmentResponse assignJudge(UUID roundId, AssignJudgeRequest request, Authentication authentication);

    void removeJudgeAssignment(UUID roundId, UUID assignmentId, Authentication authentication);
}
