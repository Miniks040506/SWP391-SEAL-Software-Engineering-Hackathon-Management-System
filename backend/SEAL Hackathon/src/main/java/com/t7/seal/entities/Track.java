package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tracks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

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
    private Integer maxMembers = 5;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @OneToMany(
            mappedBy = "track",
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<Team> teams = new ArrayList<>();

    // Checks whether this track has a configured team limit.
    public boolean hasTeamLimit() {
        return maxTeams != null;
    }

    // Checks whether a proposed member count is within this track's allowed range.
    public boolean isMemberCountAllowed(int count) {
        return count >= minMembers && count <= maxMembers;
    }

    // Performs a coarse substring check on the required link types JSON string.
    public boolean requiresLinkType(String type) {
        return requiredLinkTypes != null
                && type != null
                && requiredLinkTypes.toUpperCase().contains(type.toUpperCase());
    }
}
