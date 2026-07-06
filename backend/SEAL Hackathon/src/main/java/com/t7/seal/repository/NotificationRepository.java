package com.t7.seal.repository;

import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(
            NotificationStatus status,
            LocalDateTime now
    );

    List<Notification> findByTypeAndTargetScopeAndTargetIdAndStatusOrderByScheduledAtAsc(
            NotificationType type,
            NotificationTargetScope targetScope,
            UUID targetId,
            NotificationStatus status
    );

    List<Notification> findByTypeAndTargetScopeAndStatusOrderByScheduledAtAsc(
            NotificationType type,
            NotificationTargetScope targetScope,
            NotificationStatus status
    );

    @Query("""
            SELECT n
            FROM Notification n
            LEFT JOIN FETCH n.event e
            WHERE e.id = :eventId
              AND n.type IN :types
            ORDER BY n.scheduledAt ASC, n.createdAt DESC
            """)
    List<Notification> findEventReminders(
            @Param("eventId") UUID eventId,
            @Param("types") List<NotificationType> types
    );

    @Query("""
            SELECT n
            FROM Notification n
            LEFT JOIN FETCH n.event e
            WHERE n.id = :id
              AND n.type IN :types
            """)
    java.util.Optional<Notification> findReminderById(
            @Param("id") UUID id,
            @Param("types") List<NotificationType> types
    );

}
