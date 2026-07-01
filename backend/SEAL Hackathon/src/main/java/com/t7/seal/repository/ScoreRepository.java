package com.t7.seal.repository;

import com.t7.seal.entities.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, UUID> {
    long countByEventCriteriaId(UUID eventCriteriaId);

    long countBySubmissionIdAndJudgeIdAndIsDraftFalse(UUID submissionId, UUID judgeId);

    long countBySubmissionIdAndJudgeIdAndIsDraftTrue(UUID submissionId, UUID judgeId);

    long countBySubmissionIdAndJudgeId(UUID submissionId, UUID judgeId);

    Optional<Score> findBySubmissionIdAndJudgeIdAndEventCriteriaId(UUID submissionId, UUID judgeId, UUID eventCriteriaId);

    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH s.judge j
            JOIN FETCH s.eventCriteria ec
            WHERE sub.id = :submissionId
              AND j.id = :judgeId
            ORDER BY ec.displayOrder ASC
            """)
    List<Score> findBySubmissionIdAndJudgeIdOrderByEventCriteriaDisplayOrderAsc(
            @Param("submissionId") UUID submissionId,
            @Param("judgeId") UUID judgeId
    );

    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH sub.round r
            JOIN FETCH r.event e
            JOIN FETCH s.judge j
            JOIN FETCH j.user u
            JOIN FETCH s.eventCriteria ec
            WHERE s.id = :scoreId
            """)
    Optional<Score> findByIdWithSubmissionRoundJudgeCriteria(@Param("scoreId") UUID scoreId);

    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH sub.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH sub.round r
            JOIN FETCH s.judge j
            JOIN FETCH s.eventCriteria ec
            WHERE r.id = :roundId
              AND s.isDraft = false
            """)
    List<Score> findConfirmedByRoundId(@Param("roundId") UUID roundId);

    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH s.judge j
            JOIN FETCH s.eventCriteria ec
            LEFT JOIN FETCH ec.criteria c
            WHERE sub.id = :submissionId
              AND s.isDraft = false
            ORDER BY ec.displayOrder ASC
            """)
    List<Score> findConfirmedBySubmissionIdWithCriteria(@Param("submissionId") UUID submissionId);


    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH sub.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH sub.round r
            JOIN FETCH r.event e
            JOIN FETCH s.judge j
            JOIN FETCH j.user ju
            JOIN FETCH s.eventCriteria ec
            LEFT JOIN FETCH ec.criteria c
            WHERE e.id = :eventId
              AND (:roundId IS NULL OR r.id = :roundId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (:includeDraftScores = true OR s.isDraft = false)
              AND (:includeDisqualified = true OR CAST(sub.status AS STRING) <> 'DISQUALIFIED')
            ORDER BY r.orderIndex ASC, tr.name ASC, t.name ASC, ju.fullName ASC, ec.displayOrder ASC
            """)
    List<Score> findForScoreExport(
            @Param("eventId") UUID eventId,
            @Param("roundId") UUID roundId,
            @Param("trackId") UUID trackId,
            @Param("includeDraftScores") boolean includeDraftScores,
            @Param("includeDisqualified") boolean includeDisqualified
    );

    @Query("""
            SELECT s
            FROM Score s
            JOIN FETCH s.submission sub
            JOIN FETCH sub.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH sub.round r
            JOIN FETCH r.event e
            JOIN FETCH s.judge j
            JOIN FETCH s.eventCriteria ec
            LEFT JOIN FETCH ec.criteria c
            WHERE e.id = :eventId
              AND (:roundId IS NULL OR r.id = :roundId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND s.isDraft = false
              AND CAST(sub.status AS STRING) <> 'DISQUALIFIED'
            ORDER BY r.orderIndex ASC, tr.name ASC, ec.displayOrder ASC, j.id ASC
            """)
    List<Score> findConfirmedScoresForRblDashboard(
            @Param("eventId") UUID eventId,
            @Param("roundId") UUID roundId,
            @Param("trackId") UUID trackId
    );

}
