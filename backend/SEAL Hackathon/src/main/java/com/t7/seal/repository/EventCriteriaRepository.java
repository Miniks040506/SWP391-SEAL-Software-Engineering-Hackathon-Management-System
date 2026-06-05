package com.t7.seal.repository;

import com.t7.seal.entities.EventCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventCriteriaRepository extends JpaRepository<EventCriteria, UUID> {

    int countByCriteriaId(UUID criteriaId);

    List<EventCriteria> findByEventIdOrderByDisplayOrderAsc(UUID eventId);

    boolean existsByEventIdAndCriteriaIdAndIsActiveTrue(UUID eventId, UUID criteriaId);

    @Query("""
            SELECT MAX(ec.displayOrder) FROM EventCriteria ec
                WHERE ec.event.id = :eventId
            """)
    Integer findMaxDisplayOrderByEventId(@Param("eventId") UUID eventId);

    List<EventCriteria> findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID eventId);
}
