package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
}
