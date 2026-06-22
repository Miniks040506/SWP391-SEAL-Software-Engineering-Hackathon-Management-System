package com.t7.seal.repository;

import com.t7.seal.entities.RoundJudgeAssignment;
import com.t7.seal.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundJudgeAssignmentRepository extends JpaRepository<RoundJudgeAssignment, UUID> {

    @Query("""
            SELECT rja
            FROM RoundJudgeAssignment rja
            JOIN FETCH rja.round r
            JOIN FETCH rja.judge j
            JOIN FETCH j.user u
            LEFT JOIN FETCH rja.track t
            WHERE r.id = :roundId
            ORDER BY u.fullName ASC
            """)
    List<RoundJudgeAssignment> findByRoundIdWithJudgeAndTrack(@Param("roundId") UUID roundId);

    Optional<RoundJudgeAssignment> findByIdAndRoundId(UUID id, UUID roundId);

    @Query("""
            SELECT CASE WHEN COUNT(rja) > 0 THEN true ELSE false END
            FROM RoundJudgeAssignment rja
            WHERE rja.round.id = :roundId
              AND rja.judge.id = :judgeId
              AND (
                    (:trackId IS NULL AND rja.track IS NULL)
                    OR (:trackId IS NOT NULL and rja.track.id = :trackId)
                  )
            """)
    boolean existsOverlappingAssignment(
            @Param("roundId") UUID roundId,
            @Param("judgeId") UUID judgeId,
            @Param("trackId") UUID trackId
    );

    @Query("""
            SELECT CASE WHEN COUNT(rja) > 0 THEN true ELSE false END
            FROM RoundJudgeAssignment rja
            JOIN rja.round r
            JOIN r.event e
            LEFT JOIN rja.track t
            JOIN rja.judge j
            JOIN j.user u
            WHERE u.id = :userId
              AND e.id = :eventId
              AND (
                    rja.track IS NULL
                    OR t.id = :trackId
                  )
            """)
    boolean existsJudgeAssignedToTrackInSameEvent(
            @Param("userId") UUID userId,
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId
    );

    @Query("""
            SELECT rja
            FROM RoundJudgeAssignment rja
            JOIN FETCH rja.round r
            JOIN FETCH r.event e
            JOIN FETCH rja.judge j
            JOIN FETCH j.user u
            LEFT JOIN FETCH rja.track t
            WHERE j.id = :judgeId
            ORDER BY r.orderIndex ASC, t.name ASC
            """)
    List<RoundJudgeAssignment> findByJudgeIdWithRoundAndTrack(@Param("judgeId") UUID judgeId);

    @Query("""
            SELECT rja
            FROM RoundJudgeAssignment rja
            JOIN FETCH rja.round r
            JOIN FETCH r.event e
            JOIN FETCH rja.judge j
            JOIN FETCH j.user u
            LEFT JOIN FETCH rja.track t
            WHERE j.id = :judgeId
              AND r.id = :roundId
            ORDER BY t.name ASC
            """)
    List<RoundJudgeAssignment> findByJudgeIdAndRoundIdWithRoundAndTrack(
            @Param("judgeId") UUID judgeId,
            @Param("roundId") UUID roundId
    );

    @Query("""
            SELECT DISTINCT u
            FROM RoundJudgeAssignment rja
            JOIN rja.round r
            JOIN r.event e
            JOIN rja.judge j
            JOIN j.user u
            WHERE e.id = :eventId
              AND u.status = com.t7.seal.domain.UserStatus.ACTIVE
            ORDER BY u.fullName ASC
            """)
    List<User> findActiveJudgeUsersByEventId(@Param("eventId") UUID eventId);

    @Query("""
            SELECT DISTINCT u
            FROM RoundJudgeAssignment rja
            JOIN rja.judge j
            JOIN j.user u
            WHERE rja.round.id = :roundId
              AND u.status = com.t7.seal.domain.UserStatus.ACTIVE
            ORDER BY u.fullName ASC
            """)
    List<User> findActiveJudgeUsersByRoundId(@Param("roundId") UUID roundId);

    @Query("""
            SELECT CASE WHEN COUNT(rja) > 0 THEN true ELSE false END
            FROM RoundJudgeAssignment rja
            JOIN rja.round r
            JOIN r.event e
            JOIN rja.judge j
            WHERE j.id = :judgeId
              AND e.id = :eventId
            """)
    boolean existsByJudgeIdAndEventId(
            @Param("judgeId") UUID judgeId,
            @Param("eventId") UUID eventId
    );

}
