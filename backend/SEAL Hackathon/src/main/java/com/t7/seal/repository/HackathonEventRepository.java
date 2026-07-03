package com.t7.seal.repository;

import com.t7.seal.domain.HackathonSeason;
import com.t7.seal.entities.HackathonEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, UUID> {
    @Query("""
            SELECT e FROM HackathonEvent e 
                WHERE e.id = :eventId 
                    AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED', 'ARCHIVED')
            """)
    Optional<HackathonEvent> findPublicEventById(
            @Param("eventId") UUID eventId);

    @Query("""
                SELECT e FROM HackathonEvent e
                        WHERE CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED', 'ARCHIVED')
                                AND( :season IS NULL OR CAST(e.season AS STRING) = :season)
                                        AND (:status IS NULL OR CAST(e.status AS STRING) = :status)
                                                AND (:year IS NULL OR e.year = :year)
                                                        ORDER BY e.year DESC, e.registrationOpen DESC
            """)
    Page<HackathonEvent> searchPublicEvents(
            @Param("status") String status,
            @Param("season") String season,
            @Param("year") Integer year,
            Pageable pageable
    );

    @Query("""
                SELECT e FROM HackathonEvent e
                        WHERE( :season IS NULL OR CAST(e.season AS STRING) = :season)
                                AND (:status IS NULL OR CAST(e.status AS STRING) = :status)
                                        AND (:year IS NULL OR e.year = :year)
                                                ORDER BY e.year DESC, e.registrationOpen DESC
            """)
    Page<HackathonEvent> searchAllEvents(
            @Param("status") String status,
            @Param("season") String season,
            @Param("year") Integer year,
            Pageable pageable
    );

    boolean existsByNameIgnoreCaseAndYear(
            String name, Integer year);

    @Query("""
            SELECT COUNT(e) > 0
            FROM HackathonEvent e
            WHERE e.season = :season
              AND (:excludedEventId IS NULL OR e.id <> :excludedEventId)
              AND e.status NOT IN (
                    com.t7.seal.domain.RegistrationStatus.CANCELLED,
                    com.t7.seal.domain.RegistrationStatus.ARCHIVED
              )
              AND e.competitionStartAt < :competitionEndAt
              AND e.competitionEndAt > :competitionStartAt
            """)
    boolean existsOverlappingCompetitionPeriod(
            @Param("season") HackathonSeason season,
            @Param("excludedEventId") UUID excludedEventId,
            @Param("competitionStartAt") LocalDateTime competitionStartAt,
            @Param("competitionEndAt") LocalDateTime competitionEndAt
    );

    List<HackathonEvent> findByCreatedByIdOrderByYearDescCreatedAtDesc(UUID userId);

    @Query("""
                    SELECT e FROM HackathonEvent e 
                        WHERE e.id = :eventId 
                            AND CAST(e.status AS STRING)  IN  ('DRAFT', 'REGISTRATION')
            """)
    Optional<HackathonEvent> findByIdCanAssignedPrize(
            @Param("eventId") UUID id);
}
