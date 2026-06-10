package com.t7.seal.repository;

import com.t7.seal.domain.MentorFeedbackVisibility;
import com.t7.seal.entities.MentorFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, UUID> {
    List<MentorFeedback> findByTeamIdOrderByCreatedAtDesc(UUID teamId);

    List<MentorFeedback> findByTeamIdAndVisibilityOrderByCreatedAtDesc(
            UUID teamId, MentorFeedbackVisibility visibility);
}
