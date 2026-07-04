package com.t7.seal.repository;

import com.t7.seal.entities.Prize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrizeRepository extends JpaRepository<Prize, UUID> {

    @Query("""
            SELECT p FROM Prize p
                JOIN p.event e
                    WHERE e.id = :eventId
                        AND CAST(e.status AS STRING) NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
                            ORDER BY p.rankPosition ASC
            """)
    List<Prize> findPublicByEventId(@Param("eventId") UUID eventId);

    @Query("""
            SELECT p FROM Prize p
                LEFT JOIN p.track t
                    WHERE p.event.id = :eventId
                        ORDER BY CASE WHEN t IS NULL THEN 0 ELSE 1 END, t.name ASC, p.rankPosition ASC
            """)
    List<Prize> findByEventIdOrderByTrackNameAndRankPositionAsc(@Param("eventId") UUID eventId);

    @Query("""
            SELECT p FROM Prize p
            LEFT JOIN FETCH p.track t
            LEFT JOIN FETCH p.awardedTeam at
            WHERE p.event.id = :eventId
              AND p.awardedTeam IS NOT NULL
            ORDER BY CASE WHEN t IS NULL THEN 0 ELSE 1 END, t.name ASC, p.rankPosition ASC
            """)
    List<Prize> findAwardedByEventIdOrderByTrackNameAndRankPositionAsc(@Param("eventId") UUID eventId);

    @Query("""
            SELECT COUNT(p)
            FROM Prize p
            WHERE p.event.id = :eventId
              AND p.awardedTeam.id = :teamId
              AND p.id <> :exceptPrizeId
            """)
    long countAwardedByEventIdAndTeamIdExceptPrize(
            @Param("eventId") UUID eventId,
            @Param("teamId") UUID teamId,
            @Param("exceptPrizeId") UUID exceptPrizeId
    );

    @Query("""
            SELECT p FROM Prize p
                JOIN p.event e
                    WHERE p.id = :prizeId
                        AND CAST(e.status AS STRING) NOT IN ('DRAFT', 'CANCELLED', 'ARCHIVED')
            """)
    Optional<Prize> findPublicById(@Param("prizeId") UUID prizeId);

    @Query("""
            SELECT COUNT(p) > 0
            FROM Prize p
            WHERE p.event.id = :eventId
              AND p.rankPosition = :rankPosition
              AND (
                    (:trackId IS NULL AND p.track IS NULL)
                    OR (:trackId IS NOT NULL AND p.track.id = :trackId)
              )
            """)
    boolean existsSameRank(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("rankPosition") Integer rankPosition
    );

    @Query("""
            SELECT COUNT(p) > 0
            FROM Prize p
            WHERE p.event.id = :eventId
              AND p.rankPosition = :rankPosition
              AND p.id <> :prizeId
              AND (
                    (:trackId IS NULL AND p.track IS NULL)
                    OR (:trackId IS NOT NULL AND p.track.id = :trackId)
              )
            """)
    boolean existsSameRankExceptSelf(
            @Param("prizeId") UUID prizeId,
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("rankPosition") Integer rankPosition
    );

    @Query("""
            SELECT p FROM Prize p
            WHERE p.id = :prizeId
              AND (:eventId IS NULL OR p.event.id = :eventId)
              AND (
                    (:trackId IS NULL AND p.track IS NULL)
                    OR (:trackId IS NOT NULL AND p.track.id = :trackId)
                    OR (:trackId IS NULL)
              )
            """)
    Optional<Prize> findPrizeByIdInEventAndTrack(
            @Param("prizeId") UUID prizeId,
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId);


    @Query("""
            SELECT p FROM Prize p
            JOIN FETCH p.awardedTeam at
            WHERE p.event.id = :eventId
              AND at.id = :teamId
            """)
    List<Prize> findAwardedByEventIdAndTeamId(
            @Param("eventId") UUID eventId,
            @Param("teamId") UUID teamId
    );
}
