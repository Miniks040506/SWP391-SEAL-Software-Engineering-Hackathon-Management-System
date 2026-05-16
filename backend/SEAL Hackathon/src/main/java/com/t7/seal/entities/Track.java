package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "track")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(length = 200, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_link_types", length = 200)
    private String requiredLinkTypes;

    @Column(name = "max_teams")
    private Integer maxTeams;

    @Column(name = "min_members", nullable = false)
    @Builder.Default
    private Integer minMembers = 3;

    @Column(name = "max_members", nullable = false)
    @Builder.Default
    private Integer max_members = 5;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
