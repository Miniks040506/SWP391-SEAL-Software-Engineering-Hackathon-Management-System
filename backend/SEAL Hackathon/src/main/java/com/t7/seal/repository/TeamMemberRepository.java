package com.t7.seal.repository;

import com.t7.seal.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    List<TeamMember> findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(UUID teamId);

    boolean existsByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);

    Optional<TeamMember> findByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);

    @Query("""
            SELECT COUNT(m) > 0
            FROM TeamMember m
            JOIN m.team t
            WHERE m.user.id = :userId
              AND m.leftAt IS NULL
              AND t.id <> :teamId
              AND t.track IS NOT NULL
              AND t.track.id = :trackId
            """)
    boolean existsActiveMembershipInSameTrack(
            @Param("userId") UUID userId,
            @Param("teamId") UUID teamId,
            @Param("trackId") UUID trackId
    );

    @Query("""
                SELECT CASE WHEN COUNT(tm) > 0 THEN TRUE ELSE FALSE END
                    FROM TeamMember tm 
                    JOIN tm.team otherTeam 
                    JOIN otherTeam.track t
                        WHERE tm.leftAt IS NULL 
                        AND tm.user.id = :userId
                        AND otherTeam.id <> :currentTeamId
                        AND t.event.id = :eventId
                        AND CAST(otherTeam.status AS STRING) NOT IN ('FORMING')
            """)
    boolean existsActiveRegisteredMembershipInEvent(
            @Param("userId") UUID userId,
            @Param("currentTeamId") UUID currentTeamId,
            @Param("eventId") UUID eventId
    );
}
