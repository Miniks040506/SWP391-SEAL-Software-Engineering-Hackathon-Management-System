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

    List<Score> findBySubmissionIdAndJudgeIdOrderByEventCriteriaDisplayOrderAsc(UUID submissionId, UUID judgeId);

    Optional<Score> findBySubmissionIdAndJudgeIdAndEventCriteriaId(UUID submissionId, UUID judgeId, UUID eventCriteriaId);

    @Query("""
            SELECT s FROM Score s 
                JOIN FETCH s.submission su 
                JOIN FETCH su.round r 
                JOIN FETCH r.event ew
                JOIN FETCH s.judge j
                JOIN FETCH j.user u 
                JOIN FETCH s.eventCriteria ec 
                WHERE s.id = :id 
            """)
    Optional<Score> findByIdWithSubmissionRoundJudgeCriteria(
            @Param("id") UUID id
    );
}
