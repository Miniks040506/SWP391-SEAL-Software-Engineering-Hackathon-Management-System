package com.t7.seal.service;

import com.t7.seal.entities.Submission;
import com.t7.seal.entities.SubmissionAttempt;
import com.t7.seal.entities.SubmissionAttemptLink;
import com.t7.seal.entities.SubmissionLink;
import com.t7.seal.repository.SubmissionAttemptLinkRepository;
import com.t7.seal.repository.SubmissionAttemptRepository;
import com.t7.seal.repository.SubmissionLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionAttemptSnapshotService {

    private final SubmissionAttemptRepository attemptRepository;
    private final SubmissionAttemptLinkRepository attemptLinkRepository;
    private final SubmissionLinkRepository submissionLinkRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public SubmissionAttempt createSnapshot(Submission submission) {
        validateFinalizedSubmission(submission);

        return attemptRepository
                .findBySubmissionIdAndAttemptNumber(
                        submission.getId(),
                        submission.getSubmissionNumber()
                )
                .orElseGet(() -> persistSnapshot(submission));
    }

    private SubmissionAttempt persistSnapshot(Submission submission) {
        SubmissionAttempt attempt = attemptRepository.saveAndFlush(
                SubmissionAttempt.builder()
                        .submission(submission)
                        .attemptNumber(submission.getSubmissionNumber())
                        .note(submission.getNote())
                        .status(submission.getStatus())
                        .submittedAt(submission.getSubmittedAt())
                        .build()
        );

        List<SubmissionAttemptLink> evidence = submissionLinkRepository
                .findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submission.getId())
                .stream()
                .map(link -> copyEvidence(attempt, link))
                .toList();
        attemptLinkRepository.saveAll(evidence);
        return attempt;
    }

    private SubmissionAttemptLink copyEvidence(
            SubmissionAttempt attempt,
            SubmissionLink link
    ) {
        return SubmissionAttemptLink.builder()
                .attempt(attempt)
                .sourceLinkId(link.getId())
                .linkType(link.getLinkType())
                .url(link.getUrl())
                .label(link.getLabel())
                .storageProvider(link.getStorageProvider())
                .objectKey(link.getObjectKey())
                .originalFileName(link.getOriginalFileName())
                .contentType(link.getContentType())
                .fileSizeBytes(link.getFileSizeBytes())
                .providerResourceId(link.getProviderResourceId())
                .providerChecksum(link.getProviderChecksum())
                .providerModifiedAt(link.getProviderModifiedAt())
                .repoMetadata(link.getRepoMetadata())
                .isPrimary(link.getIsPrimary())
                .displayOrder(link.getDisplayOrder())
                .build();
    }

    private void validateFinalizedSubmission(Submission submission) {
        if (submission == null || submission.getId() == null) {
            throw new IllegalArgumentException("A persisted submission is required for snapshotting.");
        }
        if (!submission.isScorable()) {
            throw new IllegalStateException("Only submitted or late submissions can be snapshotted.");
        }
        if (submission.getSubmissionNumber() == null || submission.getSubmissionNumber() < 1) {
            throw new IllegalStateException("Submission attempt number must be positive.");
        }
        if (submission.getSubmittedAt() == null) {
            throw new IllegalStateException("Finalized submission timestamp is required.");
        }
    }
}
