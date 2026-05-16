package com.t7.seal.entities;

import com.t7.seal.domain.MentorFeedbackCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentor_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "team_id", nullable = false)
    private UUID teamId;

    @Column(name = "mentor_user_id", nullable = false)
    private UUID mentorUserId;

    @Column(name = "round_id", nullable = false)
    private UUID roundId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MentorFeedbackCategory category = MentorFeedbackCategory.GENERAL;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Checks whether this feedback is specific to a round.
    public boolean isRoundSpecific() {
        return roundId != null;
    }

    // Checks whether this feedback has enough meaningful content.
    public boolean hasValidContentLength() {
        return content != null && content.trim().length() >= 20;
    }
}
