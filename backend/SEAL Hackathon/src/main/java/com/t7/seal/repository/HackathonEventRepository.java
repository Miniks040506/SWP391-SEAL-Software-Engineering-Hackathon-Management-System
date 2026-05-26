package com.t7.seal.repository;

import com.t7.seal.entities.HackathonEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HackathonEventRepository extends JpaRepository<HackathonEvent, UUID> {
    @Query("""
            SELECT e FROM HackathonEvent e 
                WHERE e.id = :eventId 
                    AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED')
            """)
    Optional<HackathonEvent> findPublicEventById(
            @Param("eventId") UUID eventId);

    @Query("""
                SELECT e FROM HackathonEvent e
                        WHERE CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED')
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
    
    boolean existsByNameIgnoreCaseAndYear(
            String name, Integer year);
}
