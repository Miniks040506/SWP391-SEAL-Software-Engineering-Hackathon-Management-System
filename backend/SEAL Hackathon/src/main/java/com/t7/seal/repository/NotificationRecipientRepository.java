package com.t7.seal.repository;

import com.t7.seal.entities.NotificationRecipient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRecipientRepository extends JpaRepository<NotificationRecipient, UUID> {

    Optional<NotificationRecipient> findByNotificationIdAndUserId(UUID notificationId, UUID userId);

    @Query(value = """
        select nr
        from NotificationRecipient nr
          join fetch nr.notification n
          left join fetch n.event
        where nr.user.id = :userId
          and (:read is null or (:read = true and nr.readAt is not null) or (:read = false and nr.readAt is null))
        """,
        countQuery = """
        select count(nr)
        from NotificationRecipient nr
        where nr.user.id = :userId
          and (:read is null or (:read = true and nr.readAt is not null) or (:read = false and nr.readAt is null))
        """)
    Page<NotificationRecipient> findInbox(
            @Param("userId") UUID userId,
            @Param("read") Boolean read,
            Pageable pageable
    );

    long countByUserIdAndReadAtIsNull(UUID userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update NotificationRecipient nr
        set nr.readAt = :readAt,
            nr.deliveredAt = coalesce(nr.deliveredAt, :readAt)
        where nr.user.id = :userId
          and nr.readAt is null
        """)
    int markAllAsRead(@Param("userId") UUID userId, @Param("readAt") LocalDateTime readAt);

    List<NotificationRecipient> findByNotificationId(UUID notificationId);
}
