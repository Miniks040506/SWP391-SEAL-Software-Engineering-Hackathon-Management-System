package com.t7.seal.entities;

import com.t7.seal.domain.TeamStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CollectionId;

import java.util.UUID;

@Entity
@Table(name = "team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "track_id", nullable = false)
    private UUID trackId;

    @Column(name = "leader_id", nullable = false)
    private UUID leaderId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "join_code", nullable = false, length = 20)
    private String joinCode;

    @Column(name = "join_code_enable", nullable = false)
    @Builder.Default
    private Boolean joinCodeEnable = true;

    @Column(name = "project_title", length = 300)
    private String projectTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TeamStatus status = TeamStatus.FORMING;
}
