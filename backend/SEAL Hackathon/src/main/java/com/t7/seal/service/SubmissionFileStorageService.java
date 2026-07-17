package com.t7.seal.service;

import com.t7.seal.dto.UploadedSubmissionFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

public interface SubmissionFileStorageService {
    UploadedSubmissionFile uploadSubmissionFile(UUID eventId, UUID teamId, UUID roundId, MultipartFile file);

    UploadedSubmissionFile uploadSubmissionFile(
            UUID eventId,
            UUID teamId,
            UUID roundId,
            String originalFileName,
            String contentType,
            long fileSizeBytes,
            InputStream content
    );

    String createDownloadUrl(String objectKey, Duration ttl);

    void deleteSubmissionFile(String objectKey);
}

