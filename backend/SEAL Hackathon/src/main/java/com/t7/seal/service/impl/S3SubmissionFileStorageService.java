package com.t7.seal.service.impl;

import com.t7.seal.config.SubmissionProperties;
import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.SubmissionUploadException;
import com.t7.seal.service.SubmissionFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
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

    private final SubmissionProperties submissionProperties;

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

        try (S3Client s3Client = buildClient()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(
                    file.getInputStream(),
                    file.getSize()
            ));
        } catch (IOException e) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_UNREADABLE",
                    "Cannot read uploaded submission file."
            );
        }

        return new UploadedSubmissionFile(
                buildFileUrl(objectKey),
                objectKey,
                originalFilename,
                file.getContentType(),
                file.getSize()
        );
    }

    @Override
    public String createDownloadUrl(String objectKey, Duration ttl) {
        validateConfiguration();

        if (isBlank(objectKey)) {
            throw new BadRequestException("Submission file object key is missing.");
        }

        try (S3Presigner presigner = buildPresigner()) {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(ttl == null ? Duration.ofMinutes(10) : ttl)
                    .getObjectRequest(getObjectRequest)
                    .build();

            return presigner.presignGetObject(presignRequest)
                    .url()
                    .toString();
        }
    }

    private void validateConfiguration() {
        if (!"AWS_S3".equalsIgnoreCase(storageProvider)) {
            throw SubmissionUploadException.conflict(
                    "SUBMISSION_STORAGE_UNAVAILABLE",
                    "Submission file upload is disabled. Set app.submission.storage.provider=AWS_S3 to enable it."
            );
        }
        if (isBlank(region) || isBlank(bucket)) {
            throw SubmissionUploadException.conflict(
                    "SUBMISSION_STORAGE_UNAVAILABLE",
                    "AWS S3 submission storage is not configured. Missing aws.s3.region or aws.s3.bucket."
            );
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_REQUIRED",
                    "Submission file is required."
            );
        }

        SubmissionProperties.Upload uploadPolicy = submissionProperties.getUpload();
        long maxBytes = uploadPolicy.getMaxSizeBytes();
        if (file.getSize() > maxBytes) {
            throw SubmissionUploadException.tooLarge(
                    "Submission file exceeds max size of " + uploadPolicy.getMaxSizeMb() + " MB."
            );
        }

        String contentType = file.getContentType();
        if (!uploadPolicy.getAllowedContentTypes().isEmpty() && !isBlank(contentType)) {
            boolean allowed = uploadPolicy.getAllowedContentTypes().stream()
                    .anyMatch(contentType::equalsIgnoreCase);

            if (!allowed) {
                throw SubmissionUploadException.unsupported("Unsupported file type: " + contentType);
            }
        }

        String originalFileName = file.getOriginalFilename();
        String extension = fileExtension(originalFileName);
        boolean extensionAllowed = uploadPolicy.getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(extension::equals);
        if (!extensionAllowed) {
            throw SubmissionUploadException.unsupported(
                    "Unsupported file extension: " + (extension.isEmpty() ? "none" : extension)
            );
        }
    }

    private S3Client buildClient() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider())
                .build();
    }

    private S3Presigner buildPresigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider())
                .build();
    }

    private AwsCredentialsProvider credentialsProvider() {
        if (!isBlank(accessKey) && !isBlank(secretKey)) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            );
        }

        return DefaultCredentialsProvider.create();
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

    private String buildFileUrl(String objectKey) {
        if (!isBlank(publicBaseUrl)) {
            return publicBaseUrl.replaceAll("/+$", "") + "/" + objectKey;
        }
        return "s3://" + bucket + "/" + objectKey;
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

    private String fileExtension(String fileName) {
        if (isBlank(fileName)) {
            return "";
        }
        int extensionStart = fileName.lastIndexOf('.');
        if (extensionStart < 0 || extensionStart == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(extensionStart).toLowerCase(Locale.ROOT);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
