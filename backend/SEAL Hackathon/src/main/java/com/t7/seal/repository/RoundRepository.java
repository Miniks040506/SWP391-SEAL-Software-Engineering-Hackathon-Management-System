package com.t7.seal.repository;

import com.t7.seal.domain.RoundStatus;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundRepository extends JpaRepository<Round, UUID> {

    long countByEventId(UUID eventId);

    boolean existsByIdAndEventCreatedById(UUID roundId, UUID coordinatorId);

    boolean existsByEventIdAndOrderIndex(UUID eventId, Integer orderIndex);

    boolean existsByEventIdAndNameIgnoreCase(UUID eventId, String name);

    boolean existsByEventIdAndResultPublishedAtIsNotNull(UUID eventId);

    List<Round> findByStatusAndSubmissionLockedAtIsNullAndSubmissionDeadlineLessThanEqualOrderBySubmissionDeadlineAsc(
            RoundStatus status,
            LocalDateTime submissionDeadline
    );

    @Query("""
            SELECT COUNT(r) > 0
            FROM Round r
            WHERE r.event.id = :eventId
              AND (:excludedRoundId IS NULL OR r.id <> :excludedRoundId)
              AND r.startAt < :endAt
              AND r.endAt > :startAt
            """)
    boolean existsOverlappingRoundPeriod(
            @Param("eventId") UUID eventId,
            @Param("excludedRoundId") UUID excludedRoundId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );

    @Query("""
            SELECT r FROM Round r
                JOIN r.event e 
                    WHERE e.id = :eventId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED', 'ARCHIVED')
                            ORDER BY r.orderIndex
            """)
    List<Round> findPublicByEventIdOrderByOrderIndexAsc(
            @Param("eventId") UUID eventId);

    @Query("""
            SELECT r FROM Round r
                JOIN r.event e 
                    WHERE r.id = :roundId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED', 'ARCHIVED')
                            ORDER BY r.orderIndex
            """)
    Optional<Round> findPublicById(
            @Param("roundId") UUID roundId);

    @Query("""
            SELECT r FROM Round r
                JOIN r.event e 
                    WHERE e.id = :eventId
                            ORDER BY r.orderIndex
            """)
    List<Round> findByEventIdOrderByOrderIndexAsc(
            @Param("eventId") UUID eventId);
}
