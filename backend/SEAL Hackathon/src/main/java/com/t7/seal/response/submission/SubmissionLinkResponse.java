package com.t7.seal.response.submission;


import com.t7.seal.infrastructure.RepositoryMetadata;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionLinkResponse(
        UUID id,
        String linkType,
        String url,
        String label,
        String storageProvider,
        String objectKey,
        String originalFileName,
        String contentType,
        Long fileSizeBytes,
        RepositoryMetadata repoMetadata,
        Boolean isPrimary,
        Integer displayOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
