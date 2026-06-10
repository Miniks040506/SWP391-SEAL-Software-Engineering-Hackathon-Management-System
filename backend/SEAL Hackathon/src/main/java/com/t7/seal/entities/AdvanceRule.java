package com.t7.seal.entities;

import com.t7.seal.domain.RuleType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "advance_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvanceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @Column(nullable = false)
    private Float value;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Column(length = 300)
    private String description;

    // Checks whether this advance rule applies across all tracks.
    public boolean appliesGlobally() {
        return track == null;
    }

    // Checks whether this advance rule applies to the supplied track.
    public boolean appliesToTrack(UUID trackId) {
        return appliesGlobally()
                || (track != null && track.getId() != null && track.getId().equals(trackId));
    }

    // Higher rank means higher priority per spec.
    public int priorityRank() {
        return switch (ruleType) {
            case MIN_SCORE -> 3;
            case TOP_N, TOP_PERCENT -> 2;
            case WILDCARD -> 1;
        };
    }
}
