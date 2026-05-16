package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentor_assignment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "track_id", nullable = false)
    private UUID trackId;

    @Column(name = "assign_by", nullable = false)
    private UUID assignBy;

    @Column(length = 200)
    private String note;

    @Column(name = "assign_at", nullable = false)
    @Builder.Default
    private LocalDateTime assignAt = LocalDateTime.now();

    // Checks whether this assignment matches a mentor and track for in-memory uniqueness checks.
    public boolean matches(UUID userId, UUID trackId) {
        return this.userId != null
                && this.userId.equals(userId)
                && this.trackId != null
                && this.trackId.equals(trackId);
    }
}
