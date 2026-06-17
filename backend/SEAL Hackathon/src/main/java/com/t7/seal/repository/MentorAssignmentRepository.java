package com.t7.seal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.t7.seal.entities.MentorAssignment;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, UUID> {

    List<MentorAssignment> findByTrackIdOrderByAssignedAtAsc(UUID trackId);

    boolean existsByTrackIdAndUserId(UUID trackId, UUID mentorUserId);

    @Query("""
            SELECT COUNT(ma) > 0
            FROM MentorAssignment ma
            JOIN ma.track t
            JOIN t.event e
            WHERE ma.user.id = :userId
              AND e.id = :eventId
            """)
    boolean existsByEventIdAndUserId(
            @Param("eventId") UUID eventId,
            @Param("userId") UUID mentorUserId
    );

    Optional<MentorAssignment> findByIdAndTrackId(UUID id, UUID trackId);

    @Query("""
            SELECT ma
            FROM MentorAssignment ma
            JOIN FETCH ma.track t
            JOIN FETCH t.event e
            JOIN FETCH ma.user u
            WHERE u.id = :userId
              AND (:eventId IS NULL OR e.id = :eventId)
            ORDER BY e.year DESC, e.season ASC, t.name ASC
            """)
    List<MentorAssignment> findAssignedTracksByUserId(
            @Param("userId") UUID userId,
            @Param("eventId") UUID eventId
    );

    @Query("""
            SELECT DISTINCT ma.user
            FROM MentorAssignment ma
            JOIN ma.track t
            WHERE t.id = :trackId
              AND ma.user.status = com.t7.seal.domain.UserStatus.ACTIVE
            ORDER BY ma.user.fullName ASC
            """)
    List<com.t7.seal.entities.User> findActiveMentorsByTrackId(@Param("trackId") UUID trackId);

    @Query("""
            SELECT DISTINCT ma.user
            FROM MentorAssignment ma
            JOIN ma.track t
            JOIN t.event e
            WHERE e.id = :eventId
              AND ma.user.status = com.t7.seal.domain.UserStatus.ACTIVE
            ORDER BY ma.user.fullName ASC
            """)
    List<com.t7.seal.entities.User> findActiveMentorsByEventId(@Param("eventId") UUID eventId);

}
