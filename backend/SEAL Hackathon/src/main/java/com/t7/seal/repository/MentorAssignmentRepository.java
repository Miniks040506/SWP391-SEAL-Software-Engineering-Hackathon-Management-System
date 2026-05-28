package com.t7.seal.repository;

import com.t7.seal.entities.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, UUID> {

    List<MentorAssignment> findByTrackIdOrderByAssignAtAsc(UUID trackId);

    boolean existsByTrackIdAndUserId(UUID trackId, UUID mentorUserId);
}
