package com.t7.seal.repository;

import com.t7.seal.entities.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, UUID> {
    @Query("""
            SELECT r FROM Ranking r 
                        JOIN FETCH r.submission su
                        JOIN FETCH su.team t 
                        JOIN FETCH r.round rd
                        JOIN FETCH r.track tr
                        JOIN rd.event e
                            WHERE e.resultPublishedAt IS NOT NULL
                                AND CAST(e.status AS STRING) NOT IN  ('DRAFT', 'CANCELLED')
                                AND (:eventId IS NULL OR e.id = :eventId)
                                AND (:trackId IS NULL OR tr.id = :trackId)
                                AND (:roundId IS NULL OR rd.id = :roundId)
                                            ORDER BY r.rankPosition ASC
            """)
    List<Ranking> getPublicRankings(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("roundId") UUID roundId);

    @Query("""
                    SELECT r FROM Ranking r 
                                JOIN FETCH r.submission su
                                JOIN FETCH su.team t 
                                JOIN FETCH r.round rd
                                JOIN FETCH r.track tr
                                JOIN rd.event e
                                    WHERE e.resultPublishedAt IS NOT NULL 
                                        AND t.id = :teamId
                                        ORDER BY e.year DESC, rd.orderIndex ASC, r.rankPosition ASC 
            """)
    List<Ranking> findPublicTeamHistory(
            @Param("teamId") UUID teamId);
}
