package com.t7.seal.repository;

import com.t7.seal.entities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

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
}
