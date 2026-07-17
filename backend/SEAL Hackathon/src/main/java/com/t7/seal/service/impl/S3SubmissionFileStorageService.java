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
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.PushbackInputStream;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3SubmissionFileStorageService implements SubmissionFileStorageService {

    private static final int CONTENT_INSPECTION_BYTES = 8192;

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
        if (file == null || file.isEmpty()) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_REQUIRED",
                    "Submission file is required."
            );
        }

        try (InputStream content = file.getInputStream()) {
            return uploadSubmissionFile(
                    eventId,
                    teamId,
                    roundId,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    content
            );
        } catch (IOException e) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_UNREADABLE",
                    "Cannot read uploaded submission file."
            );
        }
    }

    @Override
    public UploadedSubmissionFile uploadSubmissionFile(
            UUID eventId,
            UUID teamId,
            UUID roundId,
            String originalFileName,
            String contentType,
            long fileSizeBytes,
            InputStream content
    ) {
        validateConfiguration();
        ValidatedFile validated = validateFile(
                originalFileName, contentType, fileSizeBytes, content
        );

        String safeOriginalFileName = safeFileName(originalFileName);
        String objectKey = buildObjectKey(eventId, teamId, roundId, safeOriginalFileName);

        try (S3Client s3Client = buildClient()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .contentType(validated.contentType())
                    .contentLength(fileSizeBytes)
                    .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(validated.content(), fileSizeBytes)
            );
        } catch (SdkException exception) {
            throw SubmissionUploadException.conflict(
                    "SUBMISSION_FILE_UPLOAD_FAILED",
                    "Submission file could not be stored. Check object storage access and retry."
            );
        }

        return new UploadedSubmissionFile(
                buildFileUrl(objectKey),
                objectKey,
                safeOriginalFileName,
                validated.contentType(),
                fileSizeBytes
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

    @Override
    public void deleteSubmissionFile(String objectKey) {
        validateConfiguration();

        if (isBlank(objectKey)) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_OBJECT_KEY_MISSING",
                    "Submission file object key is missing."
            );
        }

        try (S3Client s3Client = buildClient()) {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build());
        } catch (SdkException ex) {
            throw SubmissionUploadException.conflict(
                    "SUBMISSION_FILE_DELETE_FAILED",
                    "Stored submission file could not be deleted. Retry after checking object storage access."
            );
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

    private ValidatedFile validateFile(
            String originalFileName,
            String contentType,
            long fileSizeBytes,
            InputStream content
    ) {
        if (content == null || fileSizeBytes <= 0) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_REQUIRED",
                    "Submission file is required."
            );
        }

        SubmissionProperties.Upload uploadPolicy = submissionProperties.getUpload();
        long maxBytes = uploadPolicy.getMaxSizeBytes();
        if (fileSizeBytes > maxBytes) {
            throw SubmissionUploadException.tooLarge(
                    "Submission file exceeds max size of " + uploadPolicy.getMaxSizeMb() + " MB."
            );
        }

        String normalizedContentType = normalizeContentType(contentType);
        if (isBlank(normalizedContentType)) {
            throw SubmissionUploadException.unsupported(
                    "Submission file content type is missing."
            );
        }

        if (!uploadPolicy.getAllowedContentTypes().isEmpty()) {
            boolean allowed = uploadPolicy.getAllowedContentTypes().stream()
                    .map(this::normalizeContentType)
                    .anyMatch(normalizedContentType::equals);

            if (!allowed) {
                throw SubmissionUploadException.unsupported(
                        "Unsupported file type: " + normalizedContentType
                );
            }
        }

        String extension = fileExtension(originalFileName);
        boolean extensionAllowed = uploadPolicy.getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(extension::equals);
        if (!extensionAllowed) {
            throw SubmissionUploadException.unsupported(
                    "Unsupported file extension: " + (extension.isEmpty() ? "none" : extension)
            );
        }

        if (!contentTypeMatchesExtension(normalizedContentType, extension)) {
            throw SubmissionUploadException.unsupported(
                    "File extension " + extension + " does not match content type "
                            + normalizedContentType + "."
            );
        }

        InspectedContent inspected = inspectContent(content);
        if (!matchesContentSignature(normalizedContentType, inspected.prefix())) {
            throw SubmissionUploadException.unsupported(
                    "File content does not match content type " + normalizedContentType + "."
            );
        }

        return new ValidatedFile(normalizedContentType, inspected.content());
    }

    private InspectedContent inspectContent(InputStream content) {
        PushbackInputStream inspected = new PushbackInputStream(
                content, CONTENT_INSPECTION_BYTES
        );
        try {
            byte[] prefix = inspected.readNBytes(CONTENT_INSPECTION_BYTES);
            inspected.unread(prefix);
            return new InspectedContent(prefix, inspected);
        } catch (IOException exception) {
            throw SubmissionUploadException.badRequest(
                    "SUBMISSION_FILE_UNREADABLE",
                    "Cannot inspect uploaded submission file."
            );
        }
    }

    private boolean matchesContentSignature(String contentType, byte[] prefix) {
        if (prefix == null || prefix.length == 0) {
            return false;
        }
        return switch (contentType) {
            case "application/pdf" -> startsWith(prefix, 0x25, 0x50, 0x44, 0x46, 0x2D);
            case "application/zip", "application/x-zip-compressed",
                 "application/vnd.openxmlformats-officedocument.presentationml.presentation" ->
                    isZip(prefix);
            case "application/vnd.ms-powerpoint" -> startsWith(
                    prefix, 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1
            );
            case "video/mp4" -> prefix.length >= 12
                    && prefix[4] == 'f' && prefix[5] == 't'
                    && prefix[6] == 'y' && prefix[7] == 'p';
            case "image/png" -> startsWith(
                    prefix, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
            );
            case "image/jpeg" -> startsWith(prefix, 0xFF, 0xD8, 0xFF);
            case "text/plain" -> isPlainText(prefix);
            default -> false;
        };
    }

    private boolean contentTypeMatchesExtension(String contentType, String extension) {
        return switch (contentType) {
            case "application/pdf" -> ".pdf".equals(extension);
            case "application/zip", "application/x-zip-compressed" -> ".zip".equals(extension);
            case "application/vnd.ms-powerpoint" -> ".ppt".equals(extension);
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation" ->
                    ".pptx".equals(extension);
            case "video/mp4" -> ".mp4".equals(extension);
            case "image/png" -> ".png".equals(extension);
            case "image/jpeg" -> ".jpg".equals(extension) || ".jpeg".equals(extension);
            case "text/plain" -> ".txt".equals(extension);
            default -> false;
        };
    }

    private boolean isZip(byte[] prefix) {
        return startsWith(prefix, 0x50, 0x4B, 0x03, 0x04)
                || startsWith(prefix, 0x50, 0x4B, 0x05, 0x06)
                || startsWith(prefix, 0x50, 0x4B, 0x07, 0x08);
    }

    private boolean isPlainText(byte[] prefix) {
        for (byte value : prefix) {
            int unsigned = Byte.toUnsignedInt(value);
            if (unsigned == 0 || (unsigned < 0x20
                    && unsigned != '\t' && unsigned != '\n' && unsigned != '\r')) {
                return false;
            }
        }
        return true;
    }

    private boolean startsWith(byte[] content, int... signature) {
        if (content.length < signature.length) {
            return false;
        }
        for (int index = 0; index < signature.length; index++) {
            if (Byte.toUnsignedInt(content[index]) != signature[index]) {
                return false;
            }
        }
        return true;
    }

    private String normalizeContentType(String value) {
        if (isBlank(value)) {
            return "";
        }
        int parameterStart = value.indexOf(';');
        String mediaType = parameterStart < 0 ? value : value.substring(0, parameterStart);
        return mediaType.trim().toLowerCase(Locale.ROOT);
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
        return "https://s3." + region + ".amazonaws.com/" + bucket + "/" + objectKey;
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

    private record ValidatedFile(String contentType, InputStream content) {
    }

    private record InspectedContent(byte[] prefix, PushbackInputStream content) {
    }
}
