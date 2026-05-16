package com.t7.seal.entities;

import com.t7.seal.domain.JudgeType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "judge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Judge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "judge_type", nullable = false)
    private JudgeType judgeType;

    @Column(length = 200)
    private String affiliation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "expertise_tags", length = 500)
    private String expertiseTags;

    @Column(name = "is_temporary", nullable = false)
    @Builder.Default
    private Boolean isTemporary = false;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
