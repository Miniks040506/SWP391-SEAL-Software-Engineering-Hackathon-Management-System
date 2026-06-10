package com.t7.seal.service.impl;

import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.service.SubmissionFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3SubmissionFileStorageService implements SubmissionFileStorageService {

    @Value("${app.submission.storage.provider:AWS_S3}")
    private String storageProvider;

    @Value("${aws.s3.region:}")
    private String region;

    @Value("${aws.s3.bucket:}")
    private String bucket;

    @Value("${aws.s3.public-base-url:}")
    private String publicBaseUrl;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${app.submission.upload.max-size-mb:25}")
    private long maxSizeMb;

    @Value("${app.submission.upload.allowed-content-types:" +
            "application/pdf," +
            "application/zip," +
            "application/x-zip-compressed," +
            "application/vnd.ms-powerpoint," +
            "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
            "video/mp4," +
            "image/png," +
            "image/jpeg," +
            "text/plain}")
    private String allowedContentTypes;

    @Override
    public UploadedSubmissionFile uploadSubmissionFile(
            UUID eventId,
            UUID teamId,
            UUID roundId,
            MultipartFile file
    ) {
        validateConfiguration();
        validateFile(file);

        String originalFilename = safeFileName(file.getOriginalFilename());
        String objectKey = buildObjectKey(eventId, teamId, roundId, originalFilename);

        return null;
    }

    @Override
    public String createDownloadUrl(String objectKey, Duration ttl) {
        return "";
    }

    private void validateConfiguration() {
        if (!"AWS_S3".equalsIgnoreCase(storageProvider)) {
            throw new BadRequestException("Submission file upload is disabled. " +
                    "Set app.submission.storage.provider=AWS_S3 to enable it.");
        }
        if (isBlank(region) || isBlank(bucket)) {
            throw new BadRequestException("AWS S3 submission storage is not configured. " +
                    "Missing aws.s3.region or aws.s3.bucket.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Submission file is required.");
        }

        long maxBytes = maxSizeMb * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new BadRequestException("Submission file exceeds max size of " + maxBytes + "MB.");
        }

        String contentType = file.getContentType();
        if (!isBlank(allowedContentTypes) && !isBlank(contentType)) {
            boolean allowed = Arrays.stream(allowedContentTypes.split(","))
                    .map(String::trim)
                    .anyMatch(contentType::equalsIgnoreCase);

            if (!allowed) {
                throw new BadRequestException("Unsupported file type: " + contentType);
            }
        }
    }

    private String buildObjectKey(UUID eventId, UUID teamId, UUID roundId, String fileName) {
        return "submissions/%s/event-%s/team-%s/round-%s/%s-%s".formatted(
                LocalDate.now(),
                eventId,
                teamId,
                roundId,
                UUID.randomUUID(),
                fileName
        );
    }

    private String safeFileName(String originalFilename) {
        String fallback = "submission-file";
        String value = isBlank(originalFilename) ? fallback : originalFilename;

        value = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9._-]", "-")
                .replaceAll("-+", "-")
                .toLowerCase(Locale.ROOT);

        return value.isBlank() ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
