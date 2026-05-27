package com.t7.seal.repository;

import com.t7.seal.entities.Round;
import com.t7.seal.entities.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoundRepository extends JpaRepository<Round, UUID> {
    boolean existsByEventIdAndOrderIndex(UUID eventId, Integer orderIndex);

    boolean existByEventIdAndNameIgnoreCase(UUID eventId, String name);

    @Query("""
            SELECT r FROM Round r
                JOIN r.event e 
                    WHERE e.id = :eventId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED') 
                            ORDER BY r.orderIndex
            """)
    List<Round> findPublicByEventIdOrderByOrderIndexAsc(
            @Param("eventId") UUID eventId);

    @Query("""
            SELECT r FROM Round r
                JOIN r.event e 
                    WHERE r.id = :roundId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED') 
                            ORDER BY r.orderIndex
            """)
    Optional<Round> findPublicById(
            @Param("roundId") UUID roundId);
}
