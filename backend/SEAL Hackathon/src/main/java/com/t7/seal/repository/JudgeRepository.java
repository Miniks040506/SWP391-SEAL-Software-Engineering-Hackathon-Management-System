package com.t7.seal.repository;

import com.t7.seal.entities.Judge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JudgeRepository extends JpaRepository<Judge, UUID> {

    @Query("""
            SELECT j
            FROM Judge j
            JOIN FETCH j.user u
            WHERE j.id = :judgeId
            """)
    Optional<Judge> findByIdWithUser(@Param("judgeId") UUID judgeId);

    Optional<Judge> findByUserId(UUID userId);

    @Query("""
            SELECT DISTINCT j
            FROM RoundJudgeAssignment rja
            JOIN rja.round r
            JOIN r.event e
            JOIN rja.judge j
            JOIN FETCH j.user u
            WHERE j.judgeType = com.t7.seal.domain.JudgeType.GUEST
              AND j.isTemporary = true
              AND u.status = com.t7.seal.domain.UserStatus.ACTIVE
              AND e.status = com.t7.seal.domain.RegistrationStatus.COMPLETED
              AND e.completedAt IS NOT NULL
              AND e.completedAt <= :completedBefore
              AND NOT EXISTS (
                    SELECT activeAssignment.id
                    FROM RoundJudgeAssignment activeAssignment
                    JOIN activeAssignment.round activeRound
                    JOIN activeRound.event activeEvent
                    WHERE activeAssignment.judge = j
                      AND activeEvent.status NOT IN (
                            com.t7.seal.domain.RegistrationStatus.COMPLETED,
                            com.t7.seal.domain.RegistrationStatus.CANCELLED
                      )
              )
              AND NOT EXISTS (
                    SELECT recentAssignment.id
                    FROM RoundJudgeAssignment recentAssignment
                    JOIN recentAssignment.round recentRound
                    JOIN recentRound.event recentEvent
                    WHERE recentAssignment.judge = j
                      AND recentEvent.status = com.t7.seal.domain.RegistrationStatus.COMPLETED
                      AND (
                            recentEvent.completedAt IS NULL
                            OR recentEvent.completedAt > :completedBefore
                      )
              )
            """)
    List<Judge> findActiveTemporaryGuestJudgesEligibleForDeactivation(
            @Param("completedBefore") LocalDateTime completedBefore
    );
}
