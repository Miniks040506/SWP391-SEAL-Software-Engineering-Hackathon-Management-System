package com.t7.seal.service;

import com.t7.seal.domain.RoundStatus;
import com.t7.seal.domain.SubmissionBlockedReason;
import com.t7.seal.domain.TeamRegistrationStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubmissionMutationPolicyTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2027, 8, 25, 8, 0);
    private final SubmissionMutationPolicy policy = new SubmissionMutationPolicy();

    @Test
    void allowsEligibleLeaderAndSeparatelyReportsMissingRequirements() {
        UUID leaderId = UUID.randomUUID();
        Team team = eligibleTeam(leaderId);
        Round round = openRound();

        SubmissionMutationPolicy.Evaluation allowed = policy.evaluate(
                team, round, leaderId, List.of(), NOW
        );
        assertTrue(allowed.canEdit());
        assertTrue(allowed.canSubmit());
        assertEquals(SubmissionBlockedReason.NONE, allowed.blockedReason());
        assertNull(allowed.blockedMessage());

        SubmissionMutationPolicy.Evaluation missing = policy.evaluate(
                team, round, leaderId, List.of("REPOSITORY", "DEMO"), NOW
        );
        assertTrue(missing.canEdit());
        assertFalse(missing.canSubmit());
        assertEquals(SubmissionBlockedReason.MISSING_REQUIRED_TYPES, missing.blockedReason());
        assertTrue(missing.blockedMessage().contains("REPOSITORY, DEMO"));
    }

    @Test
    void blocksNonLeaderAndIneligibleTeamStates() {
        UUID leaderId = UUID.randomUUID();
        Team team = eligibleTeam(leaderId);
        Round round = openRound();

        assertBlocked(team, round, UUID.randomUUID(), SubmissionBlockedReason.NOT_TEAM_LEADER);

        team.setTrack(null);
        assertBlocked(team, round, leaderId, SubmissionBlockedReason.TRACK_NOT_ASSIGNED);

        team = eligibleTeam(leaderId);
        team.setRegistrationStatus(TeamRegistrationStatus.PENDING_APPROVAL);
        assertBlocked(team, round, leaderId, SubmissionBlockedReason.TEAM_REGISTRATION_NOT_APPROVED);

        team = eligibleTeam(leaderId);
        team.setStatus(TeamStatus.ELIMINATED);
        assertBlocked(team, round, leaderId, SubmissionBlockedReason.TEAM_ELIMINATED);

        team = eligibleTeam(leaderId);
        team.setStatus(TeamStatus.FORMING);
        assertBlocked(team, round, leaderId, SubmissionBlockedReason.TEAM_STATUS_NOT_ELIGIBLE);
    }

    @Test
    void blocksLockedExpiredAndNonOpenRounds() {
        UUID leaderId = UUID.randomUUID();
        Team team = eligibleTeam(leaderId);

        Round locked = openRound();
        locked.setSubmissionLockedAt(NOW.minusMinutes(1));
        assertBlocked(team, locked, leaderId, SubmissionBlockedReason.ROUND_SUBMISSION_LOCKED);

        Round deadlineReached = openRound();
        deadlineReached.setSubmissionDeadline(NOW);
        assertBlocked(
                team,
                deadlineReached,
                leaderId,
                SubmissionBlockedReason.ROUND_SUBMISSION_DEADLINE_EXCEEDED
        );

        Round upcoming = openRound();
        upcoming.setStatus(RoundStatus.UPCOMING);
        assertBlocked(team, upcoming, leaderId, SubmissionBlockedReason.ROUND_NOT_OPEN);
    }

    private void assertBlocked(
            Team team,
            Round round,
            UUID userId,
            SubmissionBlockedReason reason
    ) {
        SubmissionMutationPolicy.Evaluation result = policy.evaluate(
                team, round, userId, List.of(), NOW
        );
        assertFalse(result.canEdit());
        assertFalse(result.canSubmit());
        assertEquals(reason, result.blockedReason());
    }

    private Team eligibleTeam(UUID leaderId) {
        return Team.builder()
                .leader(User.builder().id(leaderId).build())
                .track(Track.builder().id(UUID.randomUUID()).build())
                .registrationStatus(TeamRegistrationStatus.APPROVED)
                .status(TeamStatus.COMPETING)
                .build();
    }

    private Round openRound() {
        return Round.builder()
                .status(RoundStatus.OPEN)
                .submissionDeadline(NOW.plusHours(1))
                .build();
    }
}
