package com.t7.seal.repository;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID>, JpaSpecificationExecutor<Submission> {

    Optional<Submission> findByTeamIdAndRoundId(UUID teamId, UUID roundId);

    @Query("""
            SELECT DISTINCT s FROM Submission s
            LEFT JOIN FETCH s.submissionLinks l
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            LEFT JOIN FETCH r.event e
            WHERE s.id = :submissionId
            """)
    Optional<Submission> findDetailById(@Param("submissionId") UUID submissionId);

    List<Submission> findByTeamIdOrderByRoundOrderIndexAsc(UUID teamId);

    long countByTeamId(UUID teamId);

    long countByTeamIdAndStatusIn(UUID teamId, Set<SubmissionStatus> statuses);

    List<Submission> findByRoundIdOrderBySubmittedAtDesc(UUID roundId);

    @Query("""
            SELECT s FROM Submission s
            JOIN s.team t
            WHERE t.track.id = :trackId
            ORDER BY s.submittedAt DESC
            """)
    List<Submission> findByTrackIdOrderBySubmittedAtDesc(@Param("trackId") UUID trackId);

    @Query("""
            SELECT s FROM Submission s
                WHERE s.round.id = :roundId 
                    AND s.status = com.t7.seal.domain.SubmissionStatus.DRAFT
            """)
    List<Submission> findDraftsByRoundId(
            @Param("roundId") UUID roundId);

    @Query("""
            SELECT COUNT(DISTINCT s.id) 
                FROM Submission s 
                JOIN s.round r 
                JOIN s.team t
                LEFT JOIN t.track tr 
                    WHERE r.id = :roundId
                        AND (:trackId IS NULL OR tr.id = :trackId)
                        AND s.status IN (
                            com.t7.seal.domain.SubmissionStatus.SUBMITTED,
                            com.t7.seal.domain.SubmissionStatus.LATE
                        )
            """)
    long countSubmittedOrLateByRoundAndTrackNullable(
            @Param("roundId") UUID roundId,
            @Param("trackId") UUID trackId
    );

    @Query("""
            SELECT COUNT(s) FROM Submission s 
            JOIN s.team t 
                WHERE t.track.id = :trackId 
                    AND CAST(s.status AS STRING) IN ('SUBMITTED', 'LATE')
            """)
    long countSubmittedOrLateByTrackId(@Param("trackId") UUID trackId);


    @Query("""
            SELECT DISTINCT s
            FROM Submission s
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            WHERE r.id = :roundId
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND s.status IN (
                    com.t7.seal.domain.SubmissionStatus.SUBMITTED,
                    com.t7.seal.domain.SubmissionStatus.LATE
              )
            ORDER BY s.submittedAt DESC
            """)
    List<Submission> findSubmittedOrLateByRoundAndTrackNullable(
            @Param("roundId") UUID roundId,
            @Param("trackId") UUID trackId
    );

}
