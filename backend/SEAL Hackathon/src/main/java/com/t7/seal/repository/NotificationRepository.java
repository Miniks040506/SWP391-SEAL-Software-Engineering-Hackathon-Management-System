package com.t7.seal.repository;

import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop50ByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(NotificationStatus status, LocalDateTime now);

    List<Notification> findByTypeAndTargetScopeAndTargetIdAndStatusOrderByScheduledAtAsc(
            NotificationType type,
            NotificationTargetScope targetScope,
            UUID targetId,
            NotificationStatus status
    );
}
