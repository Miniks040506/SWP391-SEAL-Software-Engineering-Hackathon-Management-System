package com.t7.seal.entities;

import com.t7.seal.domain.RuleType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "advance_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvanceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "round_id", nullable = false)
    private UUID roundId;

    @Column(name = "track_id")
    private UUID trackId;

    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @Column(nullable = false)
    private Float value;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Column(length = 300)
    private String description;
}
