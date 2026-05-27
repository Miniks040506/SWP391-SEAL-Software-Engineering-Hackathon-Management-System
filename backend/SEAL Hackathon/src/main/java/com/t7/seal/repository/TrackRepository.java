package com.t7.seal.repository;

import com.t7.seal.entities.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrackRepository extends JpaRepository<Track, UUID> {
    boolean existsByEventIdAndNameIgnoreCase(UUID eventId, String name);

    @Query("""
            SELECT t FROM Track t 
                JOIN t.event e 
                    WHERE e.id = :eventId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED') 
                            ORDER BY t.name ASC 
            """)
    List<Track> findPublicByEventIdOrderByNameAsc(
            @Param("eventId") UUID eventId);

    @Query("""
            SELECT t FROM Track t 
                JOIN t.event e 
                    WHERE t.id = :trackId
                        AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED') 
                            ORDER BY t.name ASC 
            """)
    Optional<Track> findPublicById(
            @Param("trackId") UUID trackId);
}
