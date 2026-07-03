package com.t7.seal.repository;

import com.t7.seal.domain.TeamRegistrationStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Team;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    Optional<Team> findByJoinCode(String joinCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Team t WHERE t.id = :teamId")
    Optional<Team> findByIdForUpdate(@Param("teamId") UUID teamId);

    Page<Team> findByTrackIdOrderByRegisteredAtDescCreatedAtDesc(UUID trackId, Pageable pageable);

    @Query("""
            SELECT COUNT(t) > 0
            FROM Team t
            JOIN t.track tr
            JOIN tr.event e
            WHERE e.id = :eventId
            """)
    boolean existsByEventId(@Param("eventId") UUID eventId);

    @Query("""
            SELECT COUNT(t) FROM Team t 
                        WHERE t.track.id = :trackId
                                    AND t.registrationStatus = com.t7.seal.domain.TeamRegistrationStatus.APPROVED
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

    @Query("""
            SELECT t FROM Team t
            LEFT JOIN t.track tr
            LEFT JOIN tr.event e
            LEFT JOIN t.leader l
            WHERE e.id = :eventId
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (:status IS NULL OR t.status = :status)
              AND (:registrationStatus IS NULL OR t.registrationStatus = :registrationStatus)
              AND (
                    :search IS NULL OR :search = ''
                    OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(t.projectTitle, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(l.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ORDER BY t.registeredAt DESC, t.createdAt DESC
            """)
    Page<Team> searchCoordinatorTeams(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("status") TeamStatus status,
            @Param("registrationStatus") TeamRegistrationStatus registrationStatus,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT DISTINCT t FROM Team t
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            LEFT JOIN FETCH t.leader l
            WHERE t.id = :teamId
            """)
    Optional<Team> findCoordinatorDetailById(@Param("teamId") UUID teamId);

    @Query("""
            SELECT COUNT(t) FROM Team t 
                WHERE t.track.id = :trackId
                    AND t.registrationStatus = com.t7.seal.domain.TeamRegistrationStatus.APPROVED
            """)
    long countActiveMemberByTrackId(
            @Param("trackId") UUID trackId
    );

    @Query("""
            SELECT t FROM Team t
            LEFT JOIN t.track tr
            LEFT JOIN tr.event e
            LEFT JOIN t.leader l
            WHERE tr.id = :trackId
              AND (:status IS NULL OR t.status = :status)
              AND (
                    :search IS NULL OR :search = ''
                    OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(t.projectTitle, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(l.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ORDER BY t.registeredAt DESC, t.createdAt DESC
            """)
    Page<Team> searchMentorTrackTeams(
            @Param("trackId") UUID trackId,
            @Param("status") TeamStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT DISTINCT t
            FROM Team t
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            LEFT JOIN FETCH t.leader l
            WHERE t.id = :teamId
            """)
    Optional<Team> findMentorDetailsById(@Param("teamId") UUID teamId);

    @Query("""
            SELECT DISTINCT t
            FROM Team t
            LEFT JOIN t.track tr
            LEFT JOIN tr.event e
            LEFT JOIN t.leader l
            WHERE t.status = com.t7.seal.domain.TeamStatus.FORMING
              AND (:eventId IS NULL OR e.id = :eventId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (
                    :search IS NULL OR :search = ''
                    OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(t.projectTitle, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(l.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ORDER BY t.createdAt DESC
            """)
    @EntityGraph(attributePaths = {"leader", "track", "track.event"})
    Page<Team> searchFormingTeams(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
                    SELECT DISTINCT t 
                    FROM Team t
                    LEFT JOIN FETCH t.track tr 
                    LEFT JOIN FETCH tr.event e 
                    LEFT JOIN FETCH t.leader le 
                    WHERE e.id = :eventId
                        AND (:status IS NULL OR t.status = :status)
                        AND (:trackId IS NULL OR tr.id = :trackId)
                    ORDER BY tr.name ASC, t.name ASC
            """)
    List<Team> findForTeamListReport(
            @Param("eventId") UUID eventId,
            @Param("trackId") UUID trackId,
            @Param("status") TeamStatus status
    );

    @Query("""
            SELECT DISTINCT t
            FROM Team t
            JOIN FETCH t.track tr
            JOIN FETCH tr.event e
            LEFT JOIN FETCH t.leader l
            WHERE t.status = com.t7.seal.domain.TeamStatus.FORMING
              AND e.registrationClose < :now
              AND (t.memberCount IS NULL OR t.memberCount < tr.minMembers)
            """)
    List<Team> findIncompleteRegistrationCandidates(@Param("now") java.time.LocalDateTime now);
}
