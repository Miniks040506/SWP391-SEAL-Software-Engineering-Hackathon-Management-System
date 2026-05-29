package com.t7.seal.service;

import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.response.track.MentorAssignmentResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface MentorAssignmentService {
    List<MentorAssignmentResponse> getMentorAssignments(UUID trackId);

    MentorAssignmentResponse assignMentor(UUID trackId, AssignMentorRequest request, Authentication authentication);

    void removeMentorAssignment(UUID trackId, UUID assignmentId, Authentication authentication);
}
