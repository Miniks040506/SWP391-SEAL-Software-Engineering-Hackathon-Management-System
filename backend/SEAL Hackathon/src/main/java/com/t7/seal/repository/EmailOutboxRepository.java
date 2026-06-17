package com.t7.seal.repository;

import com.t7.seal.domain.EmailDeliveryStatus;
import com.t7.seal.entities.EmailOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailOutboxRepository extends JpaRepository<EmailOutbox, UUID> {
    Optional<EmailOutbox> findByIdempotencyKey(String idempotencyKey);
    List<EmailOutbox> findTop50ByStatusAndScheduledAtLessThanEqualOrderByCreatedAtAsc(EmailDeliveryStatus status, LocalDateTime now);
}
