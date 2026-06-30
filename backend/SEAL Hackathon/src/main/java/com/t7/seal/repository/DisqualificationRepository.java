package com.t7.seal.repository;

import com.t7.seal.domain.AppealStatus;
import com.t7.seal.entities.Disqualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisqualificationRepository extends JpaRepository<Disqualification, UUID> {


    @Query("""
            SELECT d FROM Disqualification d
            JOIN FETCH d.submission s
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            JOIN FETCH r.event e
            JOIN FETCH d.issuedBy issuer
            WHERE s.id = :submissionId
            """)
    Optional<Disqualification> findBySubmissionIdWithDetails(@Param("submissionId") UUID submissionId);

    @Query("""
            SELECT d FROM Disqualification d
            JOIN FETCH d.submission s
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            JOIN FETCH r.event e
            JOIN FETCH d.issuedBy issuer
            WHERE d.id = :disqualificationId
            """)
    Optional<Disqualification> findByIdWithDetails(@Param("disqualificationId") UUID disqualificationId);

    @Query("""
            SELECT d FROM Disqualification d
            JOIN FETCH d.submission s
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            JOIN FETCH r.event e
            JOIN FETCH d.issuedBy issuer
            WHERE s.id = :submissionId
              AND (d.appealStatus IS NULL OR d.appealStatus <> com.t7.seal.domain.AppealStatus.OVERTURNED)
            """)
    Optional<Disqualification> findActiveBySubmissionId(@Param("submissionId") UUID submissionId);

    @Query("""
            SELECT d FROM Disqualification d
            JOIN FETCH d.submission s
            JOIN FETCH s.team t
            LEFT JOIN FETCH t.track tr
            JOIN FETCH s.round r
            JOIN FETCH r.event e
            JOIN FETCH d.issuedBy issuer
            WHERE e.id = :eventId
              AND (:roundId IS NULL OR r.id = :roundId)
              AND (:trackId IS NULL OR tr.id = :trackId)
              AND (:appealStatus IS NULL OR d.appealStatus = :appealStatus)
            ORDER BY d.issuedAt DESC
            """)
    List<Disqualification> findByEventFilters(
            @Param("eventId") UUID eventId,
            @Param("roundId") UUID roundId,
            @Param("trackId") UUID trackId,
            @Param("appealStatus") AppealStatus appealStatus
    );
}
