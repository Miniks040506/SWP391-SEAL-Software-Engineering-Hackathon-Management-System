package com.t7.seal.service;

import com.t7.seal.domain.RoundStatus;
import com.t7.seal.domain.SubmissionBlockedReason;
import com.t7.seal.domain.TeamRegistrationStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Team;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Component
public class SubmissionMutationPolicy {

    public Evaluation evaluate(
            Team team,
            Round round,
            UUID currentUserId,
            Collection<String> missingRequiredTypes,
            LocalDateTime now
    ) {
        Objects.requireNonNull(team, "team");
        Objects.requireNonNull(round, "round");
        Objects.requireNonNull(currentUserId, "currentUserId");
        Objects.requireNonNull(now, "now");
        List<String> missing = missingRequiredTypes == null
                ? List.of()
                : missingRequiredTypes.stream().filter(Objects::nonNull).distinct().toList();

        if (team.getLeader() == null || !currentUserId.equals(team.getLeader().getId())) {
            return blocked(
                    SubmissionBlockedReason.NOT_TEAM_LEADER,
                    "Only the team leader can modify or submit deliverables."
            );
        }
        if (team.getTrack() == null) {
            return blocked(
                    SubmissionBlockedReason.TRACK_NOT_ASSIGNED,
                    "Register the team to a track before adding deliverables."
            );
        }
        if (team.getRegistrationStatus() != TeamRegistrationStatus.APPROVED) {
            return blocked(
                    SubmissionBlockedReason.TEAM_REGISTRATION_NOT_APPROVED,
                    "Only teams with approved registration may submit deliverables."
            );
        }
        if (team.getStatus() == TeamStatus.ELIMINATED) {
            return blocked(
                    SubmissionBlockedReason.TEAM_ELIMINATED,
                    "Eliminated teams cannot modify or submit deliverables."
            );
        }
        if (team.getStatus() != TeamStatus.REGISTERED
                && team.getStatus() != TeamStatus.COMPETING
                && team.getStatus() != TeamStatus.ADVANCED) {
            return blocked(
                    SubmissionBlockedReason.TEAM_STATUS_NOT_ELIGIBLE,
                    "The team's current status does not allow submissions."
            );
        }
        if (round.getSubmissionLockedAt() != null) {
            return blocked(
                    SubmissionBlockedReason.ROUND_SUBMISSION_LOCKED,
                    "Submissions are locked for this round."
            );
        }
        LocalDateTime deadline = round.getSubmissionDeadline();
        if (deadline != null && !now.isBefore(deadline)) {
            return blocked(
                    SubmissionBlockedReason.ROUND_SUBMISSION_DEADLINE_EXCEEDED,
                    "The submission deadline for this round has passed."
            );
        }
        if (round.getStatus() != RoundStatus.OPEN) {
            return blocked(
                    SubmissionBlockedReason.ROUND_NOT_OPEN,
                    "Submissions are only allowed while the round is OPEN."
            );
        }
        if (!missing.isEmpty()) {
            return new Evaluation(
                    true,
                    false,
                    SubmissionBlockedReason.MISSING_REQUIRED_TYPES,
                    "Add the missing required submission types before submitting: "
                            + String.join(", ", missing) + "."
            );
        }

        return new Evaluation(true, true, SubmissionBlockedReason.NONE, null);
    }

    private Evaluation blocked(SubmissionBlockedReason reason, String message) {
        return new Evaluation(false, false, reason, message);
    }

    public record Evaluation(
            boolean canEdit,
            boolean canSubmit,
            SubmissionBlockedReason blockedReason,
            String blockedMessage
    ) {
    }
}
