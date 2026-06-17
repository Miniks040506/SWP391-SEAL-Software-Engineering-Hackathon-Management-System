package com.t7.seal.response.mentor;

import java.time.LocalDateTime;
import java.util.UUID;

public record MentorTrackResponse(
        UUID assignmentId,
        UUID trackId,
        String trackName,
        String trackDescription,
        UUID eventId,
        String eventName,
        String eventStatus,
        Integer maxTeams,
        Integer minMembers,
        Integer maxMembers,
        long teamCount,
        long submittedSubmissionCount,
        LocalDateTime assignedAt

) {
}
