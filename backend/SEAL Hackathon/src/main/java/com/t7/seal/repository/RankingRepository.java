package com.t7.seal.repository;

import com.t7.seal.entities.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (e.resultPublishedAt IS NOT NULL OR rd.resultPublishedAt IS NOT NULL)
              AND CAST(e.status AS STRING) NOT IN ('DRAFT', 'CANCELLED')
              AND (:eventId IS NULL OR e.id = :eventId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (:roundId IS NULL OR rd.id = :roundId)
            ORDER BY rd.orderIndex ASC, tr.name ASC, r.rankPosition ASC
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
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (:eventId IS NULL OR e.id = :eventId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (:roundId IS NULL OR rd.id = :roundId)
            ORDER BY rd.orderIndex ASC, tr.name ASC, r.rankPosition ASC
            """)
    List<Ranking> getCoordinatorRankings(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("roundId") UUID roundId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (e.resultPublishedAt IS NOT NULL OR rd.resultPublishedAt IS NOT NULL)
              AND t.id = :teamId
            ORDER BY e.year DESC, rd.orderIndex ASC, r.rankPosition ASC
            """)
    List<Ranking> findPublicTeamHistory(@Param("teamId") UUID teamId);

    @Query("""
            SELECT r
            FROM Ranking r
            JOIN FETCH r.submission s
            JOIN FETCH s.team t
            JOIN FETCH r.round rd
            JOIN FETCH r.track tr
            WHERE rd.id = :roundId
            ORDER BY tr.name ASC, r.rankPosition ASC
            """)
    List<Ranking> findByRoundIdWithSubmissionTeamTrack(@Param("roundId") UUID roundId);



    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE rd.id = :roundId
              AND t.id = :teamId
            """)
    Optional<Ranking> findByRoundIdAndTeamIdWithDetails(@Param("roundId") UUID roundId,
                                                        @Param("teamId") UUID teamId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE t.id = :teamId
            ORDER BY rd.orderIndex DESC, r.calculatedAt DESC
            """)
    List<Ranking> findTeamRankingsWithDetails(@Param("teamId") UUID teamId);


    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (e.resultPublishedAt IS NOT NULL OR rd.resultPublishedAt IS NOT NULL)
              AND t.id = :teamId
            ORDER BY rd.orderIndex ASC, tr.name ASC, r.rankPosition ASC
            """)
    List<Ranking> findPublishedByTeamIdWithDetails(@Param("teamId") UUID teamId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (e.resultPublishedAt IS NOT NULL OR rd.resultPublishedAt IS NOT NULL)
              AND rd.id = :roundId
              AND t.id = :teamId
            """)
    Optional<Ranking> findPublishedByRoundIdAndTeamIdWithDetails(@Param("roundId") UUID roundId,
                                                                 @Param("teamId") UUID teamId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE (e.resultPublishedAt IS NOT NULL OR rd.resultPublishedAt IS NOT NULL)
              AND su.id = :submissionId
            """)
    Optional<Ranking> findPublishedBySubmissionIdWithDetails(@Param("submissionId") UUID submissionId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE rd.id = :roundId
              AND (:trackId IS NULL OR tr.id = :trackId)
            ORDER BY tr.name ASC, r.rankPosition ASC
            """)
    List<Ranking> findByRoundIdAndTrackIdWithDetails(@Param("roundId") UUID roundId,
                                                     @Param("trackId") UUID trackId);

    @Query("""
            SELECT r FROM Ranking r
            JOIN FETCH r.submission su
            JOIN FETCH su.team t
            JOIN FETCH r.round rd
            JOIN FETCH rd.event e
            JOIN FETCH r.track tr
            WHERE e.id = :eventId
              AND (:roundId IS NULL OR rd.id = :roundId)
              AND (:trackId IS NULL OR tr.id = :trackId)
            ORDER BY rd.orderIndex ASC, tr.name ASC, r.rankPosition ASC
            """)
    List<Ranking> findByEventRoundTrackWithDetails(@Param("eventId") UUID eventId,
                                                   @Param("roundId") UUID roundId,
                                                   @Param("trackId") UUID trackId);

    @Modifying
    @Query("""
            DELETE FROM Ranking r
            WHERE r.round.id = :roundId
              AND (:trackId IS NULL OR r.track.id = :trackId)
            """)
    int deleteByRoundIdAndTrackIdNullable(@Param("roundId") UUID roundId,
                                          @Param("trackId") UUID trackId);
}
