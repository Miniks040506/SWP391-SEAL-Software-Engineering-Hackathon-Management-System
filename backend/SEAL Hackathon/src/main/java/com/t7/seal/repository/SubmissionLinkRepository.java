package com.t7.seal.repository;

import com.t7.seal.entities.SubmissionLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionLinkRepository extends JpaRepository<SubmissionLink, UUID> {

    List<SubmissionLink> findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(UUID submissionId);

    void deleteBySubmissionIdAndObjectKeyIsNull(UUID submissionId);
}
