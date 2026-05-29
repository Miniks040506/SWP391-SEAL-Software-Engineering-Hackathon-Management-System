package com.t7.seal.service;

import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.response.track.MentorAssignmentResponse;

import java.util.List;
import java.util.UUID;

public interface MentorAssignmentService {
    List<MentorAssignmentResponse> getMentorAssignments(UUID trackId);

    MentorAssignmentResponse assignMentor(UUID trackId, AssignMentorRequest request);

    void removeMentorAssignment(UUID trackId, UUID assignmentId);
}
