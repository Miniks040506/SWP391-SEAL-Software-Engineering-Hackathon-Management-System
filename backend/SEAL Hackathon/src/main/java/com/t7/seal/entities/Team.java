package com.t7.seal.entities;

import com.t7.seal.domain.TeamStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "teams",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_team_joincode", columnNames = "join_code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "join_code", nullable = false, length = 20)
    private String joinCode;

    @Column(name = "join_code_enabled", nullable = false)
    @Builder.Default
    private Boolean joinCodeEnabled = true;

    @Column(name = "project_title", length = 300)
    private String projectTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TeamStatus status = TeamStatus.FORMING;

    @Column(name = "member_count", nullable = false)
    @Builder.Default
    private Integer memberCount = 1;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Checks whether this team is still forming.
    public boolean isForming() {
        return status == TeamStatus.FORMING;
    }

    // Checks whether the join code is enabled for this team.
    public boolean hasJoinCodeEnabled() {
        return Boolean.TRUE.equals(joinCodeEnabled);
    }

    // Checks whether this team has at least the required number of members.
    public boolean hasMinimumMembers(int minMembers) {
        return memberCount != null && memberCount >= minMembers;
    }

    // Checks whether this team has reached the supplied member limit.
    public boolean isAtMemberLimit(int maxMembers) {
        return memberCount != null && memberCount >= maxMembers;
    }

    // Registers a forming team for the event.
    public void register(LocalDateTime now) {
        if (status != TeamStatus.FORMING) {
            throw new IllegalStateException("Team must be forming to register.");
        }

        status = TeamStatus.REGISTERED;
        registeredAt = now;
    }

    // Advances a registered or competing team.
    public void advance() {
        if (status != TeamStatus.REGISTERED && status != TeamStatus.COMPETING) {
            throw new IllegalStateException("Team must be registered or competing to advance.");
        }

        status = TeamStatus.ADVANCED;
    }

    // Eliminates a team unless it is already final.
    public void eliminate() {
        if (status == TeamStatus.WINNER || status == TeamStatus.ELIMINATED) {
            throw new IllegalStateException("Team cannot be eliminated from its current status.");
        }

        status = TeamStatus.ELIMINATED;
    }

    // Marks an advanced team as the winner.
    public void markWinner() {
        if (status != TeamStatus.ADVANCED) {
            throw new IllegalStateException("Team must be advanced to become the winner.");
        }

        status = TeamStatus.WINNER;
    }

    // Increments the cached team member count.
    public void incrementMemberCount() {
        memberCount = (memberCount == null ? 0 : memberCount) + 1;
    }

    // Decrements the cached team member count when above zero.
    public void decrementMemberCount() {
        if (memberCount != null && memberCount > 0) {
            memberCount--;
        }
    }

    // 1 - N to TeamMember
    @OneToMany(
            mappedBy = "team",
            fetch = FetchType.LAZY,
            cascade = {CascadeType.MERGE, CascadeType.PERSIST},
            orphanRemoval = false //false due to UC26 constraint
    )
    private List<TeamMember> members = new ArrayList<>();
}
