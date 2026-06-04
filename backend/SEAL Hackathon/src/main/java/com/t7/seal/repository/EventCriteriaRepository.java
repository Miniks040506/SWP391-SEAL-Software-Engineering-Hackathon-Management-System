package com.t7.seal.repository;

import com.t7.seal.entities.EventCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventCriteriaRepository extends JpaRepository<EventCriteria, UUID> {

    int countByCriteriaId(UUID criteriaId);

    List<EventCriteria> findByEventIdOrderByDisplayOrderAsc(UUID eventId);
}
