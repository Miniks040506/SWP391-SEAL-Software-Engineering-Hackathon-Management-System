package com.t7.seal.repository;

import com.t7.seal.entities.SubmissionAttempt;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionAttemptRepository extends JpaRepository<SubmissionAttempt, UUID> {

    boolean existsBySubmissionIdAndAttemptNumber(UUID submissionId, Integer attemptNumber);

    Optional<SubmissionAttempt> findBySubmissionIdAndAttemptNumber(
            UUID submissionId,
            Integer attemptNumber
    );

    @EntityGraph(attributePaths = "links")
    List<SubmissionAttempt> findBySubmissionIdOrderByAttemptNumberDesc(UUID submissionId);
}
