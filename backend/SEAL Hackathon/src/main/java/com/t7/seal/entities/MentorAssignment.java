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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

    @Column(length = 200)
    private String note;

    @Column(name = "assign_at", nullable = false)
    @Builder.Default
    private LocalDateTime assignAt = LocalDateTime.now();

    // Checks whether this assignment matches a mentor and track for in-memory uniqueness checks.
    public boolean matches(UUID userId, UUID trackId) {
        UUID mentorId = user != null ? user.getId() : null;
        UUID assignedTrackId = track != null ? track.getId() : null;

        return mentorId != null
                && mentorId.equals(userId)
                && assignedTrackId != null
                && assignedTrackId.equals(trackId);
    }
}
