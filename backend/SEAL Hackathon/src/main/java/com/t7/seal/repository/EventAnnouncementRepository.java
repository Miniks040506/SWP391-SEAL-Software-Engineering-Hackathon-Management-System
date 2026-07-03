package com.t7.seal.repository;

import com.t7.seal.domain.EventAnnouncementStatus;
import com.t7.seal.entities.EventAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventAnnouncementRepository extends JpaRepository<EventAnnouncement, UUID> {

    @Query("""
            SELECT ea FROM EventAnnouncement ea
                JOIN ea.event ee
            WHERE ee.id = :eventId
              AND CAST(ee.status AS string) NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
              AND CAST(ea.status AS string) = 'PUBLISHED'
            ORDER BY ea.isPinned DESC, ea.publishedAt DESC
            """)
    List<EventAnnouncement> findPublishedByEventId(
            @Param("eventId") UUID eventId);

    @Query("""
            SELECT ea FROM EventAnnouncement ea
                JOIN ea.event ee
            WHERE ea.id = :announcementId
              AND CAST(ee.status AS string) NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
              AND CAST(ea.status AS string) = 'PUBLISHED'
            """)
    Optional<EventAnnouncement> findPublicById(
            @Param("announcementId") UUID announcementId);

    List<EventAnnouncement> findByEventIdOrderByCreatedAtDesc(UUID eventId);

    List<EventAnnouncement> findByStatusAndScheduledAtLessThanEqual(
            EventAnnouncementStatus status,
            LocalDateTime now
    );
}
