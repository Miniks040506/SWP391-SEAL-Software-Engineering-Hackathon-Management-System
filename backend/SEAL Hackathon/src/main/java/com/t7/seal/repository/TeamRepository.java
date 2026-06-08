package com.t7.seal.repository;

import com.t7.seal.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    Optional<Team> findByJoinCode(String joinCode);

    @Query("""
            SELECT COUNT(t) FROM Team t 
                        WHERE t.track.id = :trackId
                                    AND CAST(t.status AS string) <> 'DELETED' 
            """)
    int CountActiveTeamByTrackId(
            @Param("trackId") UUID trackId);


    @Query("""
            SELECT DISTINCT t FROM Team t 
                JOIN t.members m 
                    WHERE m.user.id = :userId
                        AND m.leftAt IS NULL 
                            ORDER BY t.createdAt DESC
            """)
    List<Team> findActiveTeamByUserId(
            @Param("userId") UUID userId);

}
