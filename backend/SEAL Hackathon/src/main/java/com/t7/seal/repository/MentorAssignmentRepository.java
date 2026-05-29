package com.t7.seal.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.t7.seal.entities.MentorAssignment;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, UUID> {

    List<MentorAssignment> findByTrackIdOrderByAssignedAtAsc(UUID trackId);

    boolean existsByTrackIdAndUserId(UUID trackId, UUID mentorUserId);

    Optional<MentorAssignment> findByIdAndTrackId(UUID id, UUID trackId);
}
